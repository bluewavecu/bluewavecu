import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import {
  createEmailVerificationOtpChallenge,
} from "@/lib/emailVerificationOtp";
import { sendEmailVerificationOtpEmail } from "@/lib/email";
import { writeSecurityEvent } from "@/lib/eventLog";
import { getPrisma } from "@/lib/prisma";
import { enforceRateLimit, rateLimitPresets } from "@/lib/rateLimit";
import { resendEmailVerificationSchema } from "@/lib/validators";
import { maskEmailAddress } from "@/lib/username";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const rateLimit = enforceRateLimit(
      request,
      "auth-verify-email-resend",
      rateLimitPresets.verifyEmail,
    );

    if (!rateLimit.allowed) {
      return apiError(rateLimit.message, 429);
    }

    const input = resendEmailVerificationSchema.parse(await request.json());
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { username: input.username },
    });

    if (!user || user.role !== "USER") {
      return apiError("No pending email verification found for this username.", 404);
    }

    if (user.emailVerifiedAt) {
      return apiError("This email is already verified. You can sign in now.", 400);
    }

    const challenge = await createEmailVerificationOtpChallenge(user.id);

    void sendEmailVerificationOtpEmail({
      email: user.email,
      fullName: user.fullName,
      code: challenge.code,
      expiresMinutes: challenge.expiresMinutes,
    });

    void writeSecurityEvent({
      eventType: "EMAIL_VERIFICATION_SENT",
      actorId: user.id,
      entityId: challenge.challengeId,
      message: `Email verification code resent to ${maskEmailAddress(user.email)}.`,
      severity: "INFO",
    });

    return apiSuccess({
      verificationChallengeId: challenge.challengeId,
      username: user.username,
      maskedEmail: maskEmailAddress(user.email),
      message: `A new code was sent to ${maskEmailAddress(user.email)}.`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
