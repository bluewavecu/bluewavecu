import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { sendLoginOtpEmail } from "@/lib/email";
import { emailWasDelivered, getMemberEmailDeliveryError } from "@/lib/emailDelivery";
import { writeSecurityEvent } from "@/lib/eventLog";
import { resendLoginOtpChallenge } from "@/lib/loginOtp";
import { enforceRateLimit, rateLimitPresets } from "@/lib/rateLimit";
import { getLoginBlockMessage } from "@/lib/userAccess";
import { maskEmailAddress } from "@/lib/username";
import { z } from "zod";

export const runtime = "nodejs";

const resendLoginOtpSchema = z.object({
  loginChallengeId: z.string().trim().min(1, "Verification session expired"),
});

export async function POST(request: NextRequest) {
  try {
    const rateLimit = enforceRateLimit(
      request,
      "auth-login-resend-otp",
      rateLimitPresets.verifyEmail,
    );

    if (!rateLimit.allowed) {
      return apiError(rateLimit.message, 429);
    }

    const input = resendLoginOtpSchema.parse(await request.json());
    const result = await resendLoginOtpChallenge(input.loginChallengeId);

    if (!result.ok) {
      return apiError(result.message, 400);
    }

    const loginBlockMessage = getLoginBlockMessage({
      status: result.user.status,
      deletedAt: result.user.deletedAt,
    });

    if (loginBlockMessage) {
      return apiError(loginBlockMessage, 403);
    }

    if (result.user.role !== "USER") {
      return apiError("Invalid verification session.", 400);
    }

    if (!result.user.emailVerifiedAt) {
      return apiError(
        "Verify your email before signing in. Use the verify email page to request a new code.",
        403,
      );
    }

    const emailResult = await sendLoginOtpEmail({
      email: result.user.email,
      fullName: result.user.fullName,
      code: result.code,
      challengeId: result.challengeId,
      deviceName: result.deviceName,
    });

    if (!emailWasDelivered(emailResult)) {
      void writeSecurityEvent({
        eventType: "LOGIN_OTP_FAILED",
        actorId: result.user.id,
        entityId: result.challengeId,
        message: `Failed to resend sign-in verification code to ${maskEmailAddress(result.user.email)}.`,
        severity: "ERROR",
      });

      return apiError(getMemberEmailDeliveryError(emailResult), 503);
    }

    void writeSecurityEvent({
      eventType: "LOGIN_OTP_SENT",
      actorId: result.user.id,
      entityId: result.challengeId,
      message: `Sign-in verification code resent for ${result.deviceName}.`,
      severity: "INFO",
    });

    return apiSuccess({
      loginChallengeId: result.challengeId,
      maskedEmail: maskEmailAddress(result.user.email),
      message: `A new code was sent to ${maskEmailAddress(result.user.email)}.`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
