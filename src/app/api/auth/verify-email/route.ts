import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { verifyEmailVerificationOtpChallenge } from "@/lib/emailVerificationOtp";
import { sendWelcomeEmail } from "@/lib/email";
import { writeSecurityEvent } from "@/lib/eventLog";
import { enforceRateLimit, rateLimitPresets } from "@/lib/rateLimit";
import { verifyEmailSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const rateLimit = enforceRateLimit(request, "auth-verify-email", rateLimitPresets.verifyEmail);

    if (!rateLimit.allowed) {
      return apiError(rateLimit.message, 429);
    }

    const input = verifyEmailSchema.parse(await request.json());
    const result = await verifyEmailVerificationOtpChallenge({
      challengeId: input.verificationChallengeId,
      otpCode: input.otpCode,
    });

    if (!result.ok) {
      return apiError(result.message, 400);
    }

    void sendWelcomeEmail({
      email: result.user.email,
      fullName: result.user.fullName,
      userId: result.user.id,
    });

    void writeSecurityEvent({
      eventType: "EMAIL_VERIFIED",
      actorId: result.user.id,
      entityId: result.user.id,
      message: `${result.user.fullName} verified their email address.`,
      severity: "INFO",
    });

    return apiSuccess({
      username: result.user.username,
      message: "Email verified. Sign in with your username and password.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
