import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { createAuthCookie, sanitizeUser, signAuthToken, verifyPassword } from "@/lib/auth";
import {
  createDeviceCookie,
  getDeviceTokenFromRequest,
  isTrustedDevice,
  touchTrustedDevice,
  trustDevice,
} from "@/lib/deviceTrust";
import { sendAdminAlertEmail, sendLoginAlertEmail, sendLoginOtpEmail } from "@/lib/email";
import { writeAdminEvent, writeSecurityEvent } from "@/lib/eventLog";
import { createLoginOtpChallenge, verifyLoginOtpChallenge } from "@/lib/loginOtp";
import { MEMBER_SECURITY_PATH } from "@/lib/memberRoutes";
import { createSecurityNotification } from "@/lib/notifications";
import { getPrisma } from "@/lib/prisma";
import { getClientIp, getUserAgent } from "@/lib/requestContext";
import { applyRiskAssessment, scoreLoginRisk } from "@/lib/risk";
import { createUserSession } from "@/lib/sessions";
import { enforceRateLimit, rateLimitPresets } from "@/lib/rateLimit";
import { maskEmailAddress } from "@/lib/username";
import { loginSchema } from "@/lib/validators";
import { getLoginBlockMessage } from "@/lib/userAccess";
import type { UserRole, UserStatus } from "@/types/banking";

export const runtime = "nodejs";

async function completeLogin(params: {
  user: {
    id: string;
    fullName: string;
    email: string;
    username: string;
    phone: string;
    role: UserRole;
    status: UserStatus;
    transactionsUnrestricted: boolean;
    transactionPinHash: string | null;
    statusNote: string | null;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    passwordHash: string;
  };
  request: NextRequest;
  deviceToken?: string | null;
}) {
  const ipAddress = getClientIp(params.request);
  const userAgent = getUserAgent(params.request);

  if (params.deviceToken) {
    await trustDevice({
      userId: params.user.id,
      request: params.request,
      deviceToken: params.deviceToken,
    });
  } else {
    await touchTrustedDevice(params.user.id, getDeviceTokenFromRequest(params.request));
  }

  const session = await createUserSession({
    userId: params.user.id,
    request: params.request,
  });

  const token = signAuthToken({
    userId: params.user.id,
    role: params.user.role,
    sessionId: session.id,
  });

  const loginAssessment = await scoreLoginRisk({
    userId: params.user.id,
    ipAddress,
    userAgent,
  });

  void applyRiskAssessment({
    userId: params.user.id,
    assessment: loginAssessment,
  });

  const response = apiSuccess({
    user: sanitizeUser(params.user),
    token,
  });
  response.cookies.set(createAuthCookie(token));

  if (params.deviceToken) {
    response.cookies.set(createDeviceCookie(params.deviceToken));
  }

  if (params.user.role === "USER") {
    void sendLoginAlertEmail({
      email: params.user.email,
      fullName: params.user.fullName,
      userId: params.user.id,
    });
    void createSecurityNotification({
      userId: params.user.id,
      title: "New sign-in detected",
      message: `A sign-in was recorded from ${session.deviceName}.`,
      metadata: {
        href: MEMBER_SECURITY_PATH,
        sessionId: session.id,
        deviceName: session.deviceName,
      },
    });

    void writeAdminEvent({
      eventType: "MEMBER_SIGN_IN",
      actorId: params.user.id,
      entityId: session.id,
      message: `${params.user.fullName} signed in to online banking.`,
      metadata: {
        username: params.user.username,
        email: params.user.email,
        deviceName: session.deviceName,
        ipAddress,
        status: params.user.status,
      },
    });

    void sendAdminAlertEmail({
      subject: "Member sign-in",
      message: [
        `${params.user.fullName} signed in to online banking.`,
        `Username: ${params.user.username}`,
        `Email: ${params.user.email}`,
        `Device: ${session.deviceName}`,
        `IP address: ${ipAddress ?? "Unknown"}`,
        `Account status: ${params.user.status}`,
      ].join("\n"),
      idempotencyKey: `admin-alert/login/${session.id}`,
    });
  }

  void writeSecurityEvent({
    eventType: "LOGIN_SUCCESS",
    actorId: params.user.id,
    entityId: session.id,
    message: `Successful sign-in from ${session.deviceName}.`,
    severity: "INFO",
  });

  return response;
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = enforceRateLimit(request, "auth-login", rateLimitPresets.login);

    if (!rateLimit.allowed) {
      return apiError(rateLimit.message, 429);
    }

    const input = loginSchema.parse(await request.json());
    const prisma = getPrisma();
    const ipAddress = getClientIp(request);
    const userAgent = getUserAgent(request);

    if (input.portal === "admin") {
      const user = await prisma.user.findUnique({
        where: { email: input.email! },
      });

      if (!user) {
        void writeSecurityEvent({
          eventType: "LOGIN_FAILED",
          message: "Admin login failed for unknown email.",
          severity: "WARNING",
          metadata: { emailDomain: input.email!.split("@")[1] ?? "unknown" },
        });
        return apiError("Invalid email or password", 401);
      }

      const passwordMatches = await verifyPassword(input.password!, user.passwordHash);

      if (!passwordMatches || user.role !== "ADMIN") {
        void writeSecurityEvent({
          eventType: "LOGIN_FAILED",
          actorId: user.id,
          entityId: user.id,
          message: "Admin login failed due to invalid credentials.",
          severity: "WARNING",
        });
        return apiError("Invalid email or password", 401);
      }

      const loginBlockMessage = getLoginBlockMessage({
        status: user.status,
        deletedAt: user.deletedAt,
      });

      if (loginBlockMessage) {
        return apiError(loginBlockMessage, 403);
      }

      return completeLogin({ user, request });
    }

    if (input.loginChallengeId && input.otpCode) {
      const challenge = await prisma.loginOtp.findFirst({
        where: {
          id: input.loginChallengeId,
          consumedAt: null,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      });

      if (!challenge) {
        return apiError(
          "Verification code expired or not found. Sign in again to request a new code.",
          400,
        );
      }

      const otpResult = await verifyLoginOtpChallenge({
        userId: challenge.userId,
        challengeId: input.loginChallengeId,
        otpCode: input.otpCode,
      });

      if (!otpResult.ok) {
        return apiError(otpResult.message, 400);
      }

      const loginBlockMessage = getLoginBlockMessage({
        status: challenge.user.status,
        deletedAt: challenge.user.deletedAt,
      });

      if (loginBlockMessage) {
        return apiError(loginBlockMessage, 403);
      }

      if (challenge.user.role !== "USER") {
        return apiError("Invalid username or password", 401);
      }

      return completeLogin({
        user: challenge.user,
        request,
        deviceToken: otpResult.deviceToken,
      });
    }

    const user = await prisma.user.findUnique({
      where: { username: input.username! },
    });

    if (!user) {
      void writeSecurityEvent({
        eventType: "LOGIN_FAILED",
        message: "Login failed for unknown username.",
        severity: "WARNING",
        metadata: { username: input.username },
      });
      return apiError("Invalid username or password", 401);
    }

    const passwordMatches = await verifyPassword(input.password!, user.passwordHash);

    if (!passwordMatches) {
      const failedAssessment = await scoreLoginRisk({
        userId: user.id,
        ipAddress,
        userAgent,
        loginFailed: true,
      });

      void applyRiskAssessment({
        userId: user.id,
        assessment: failedAssessment,
      });

      void writeSecurityEvent({
        eventType: "LOGIN_FAILED",
        actorId: user.id,
        entityId: user.id,
        message: "Login failed due to invalid password.",
        severity: "WARNING",
      });

      return apiError("Invalid username or password", 401);
    }

    const loginBlockMessage = getLoginBlockMessage({
      status: user.status,
      deletedAt: user.deletedAt,
    });

    if (loginBlockMessage) {
      return apiError(loginBlockMessage, 403);
    }

    if (!user.emailVerifiedAt) {
      return apiError(
        "Verify your email before signing in. Check your inbox for the verification code or request a new one on the verify email page.",
        403,
      );
    }

    if (user.role === "ADMIN") {
      return apiError("Invalid username or password", 401);
    }

    const deviceToken = getDeviceTokenFromRequest(request);
    const trusted = await isTrustedDevice(user.id, deviceToken);

    if (trusted) {
      return completeLogin({
        user,
        request,
        deviceToken: deviceToken ?? undefined,
      });
    }

    const challenge = await createLoginOtpChallenge({
      userId: user.id,
      request,
    });

    void sendLoginOtpEmail({
      email: user.email,
      fullName: user.fullName,
      code: challenge.code,
      deviceName: challenge.deviceName,
    });

    void writeSecurityEvent({
      eventType: "LOGIN_OTP_SENT",
      actorId: user.id,
      entityId: challenge.challengeId,
      message: `Sign-in verification code sent for ${challenge.deviceName}.`,
      severity: "INFO",
    });

    return NextResponse.json({
      success: true,
      data: {
        requiresOtp: true,
        loginChallengeId: challenge.challengeId,
        maskedEmail: maskEmailAddress(user.email),
        message: `Enter the 6-digit code sent to ${maskEmailAddress(user.email)}.`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
