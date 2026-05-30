import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { createAuthCookie, sanitizeUser, signAuthToken, verifyPassword } from "@/lib/auth";
import { sendLoginAlertEmail } from "@/lib/email";
import { writeSecurityEvent } from "@/lib/eventLog";
import { createSecurityNotification } from "@/lib/notifications";
import { getPrisma } from "@/lib/prisma";
import { getClientIp, getUserAgent } from "@/lib/requestContext";
import { applyRiskAssessment, scoreLoginRisk } from "@/lib/risk";
import { createUserSession } from "@/lib/sessions";
import { enforceRateLimit, rateLimitPresets } from "@/lib/rateLimit";
import { loginSchema } from "@/lib/validators";

export const runtime = "nodejs";

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

    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      void writeSecurityEvent({
        eventType: "LOGIN_FAILED",
        message: "Login failed for unknown email.",
        severity: "WARNING",
        metadata: { emailDomain: input.email.split("@")[1] ?? "unknown" },
      });
      return apiError("Invalid email or password", 401);
    }

    const passwordMatches = await verifyPassword(input.password, user.passwordHash);

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

      return apiError("Invalid email or password", 401);
    }

    if (user.status === "SUSPENDED") {
      return apiError("This account is suspended", 403);
    }

    const session = await createUserSession({
      userId: user.id,
      request,
    });

    const token = signAuthToken({
      userId: user.id,
      role: user.role,
      sessionId: session.id,
    });

    const loginAssessment = await scoreLoginRisk({
      userId: user.id,
      ipAddress,
      userAgent,
    });

    void applyRiskAssessment({
      userId: user.id,
      assessment: loginAssessment,
    });

    const response = apiSuccess({
      user: sanitizeUser(user),
      token,
    });
    response.cookies.set(createAuthCookie(token));

    void sendLoginAlertEmail({
      email: user.email,
      fullName: user.fullName,
      userId: user.id,
    });
    void createSecurityNotification({
      userId: user.id,
      title: "New sign-in detected",
      message: `A sign-in was recorded from ${session.deviceName}.`,
      metadata: {
        href: "/security",
        sessionId: session.id,
        deviceName: session.deviceName,
      },
    });

    void writeSecurityEvent({
      eventType: "LOGIN_SUCCESS",
      actorId: user.id,
      entityId: session.id,
      message: `Successful sign-in from ${session.deviceName}.`,
      severity: "INFO",
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
