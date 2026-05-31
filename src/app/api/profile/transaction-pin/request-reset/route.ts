import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveRequestAuth } from "@/lib/requestAuth";
import { sendTransactionPinResetOtpEmail } from "@/lib/email";
import { writeSecurityEvent } from "@/lib/eventLog";
import { getPrisma } from "@/lib/prisma";
import { enforceRateLimit, rateLimitPresets } from "@/lib/rateLimit";
import { createTransactionPinResetChallenge } from "@/lib/transactionPinReset";
import { maskEmailAddress } from "@/lib/username";
import { transactionPinResetRequestSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }

    const rateLimit = enforceRateLimit(
      request,
      `transaction-pin-reset-${auth.payload.userId}`,
      rateLimitPresets.verifyEmail,
    );

    if (!rateLimit.allowed) {
      return apiError(rateLimit.message, 429);
    }

    transactionPinResetRequestSchema.parse(await request.json().catch(() => ({})));

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: auth.payload.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt || user.role !== "USER") {
      return apiError("Unauthorized", 401);
    }

    const challenge = await createTransactionPinResetChallenge(user.id);

    void sendTransactionPinResetOtpEmail({
      email: user.email,
      fullName: user.fullName,
      code: challenge.code,
      expiresMinutes: challenge.expiresMinutes,
    });

    void writeSecurityEvent({
      eventType: "TRANSACTION_PIN_RESET_REQUESTED",
      actorId: user.id,
      entityId: challenge.challengeId,
      message: `Transaction PIN reset code sent to ${maskEmailAddress(user.email)}.`,
      severity: "INFO",
    });

    return apiSuccess({
      challengeId: challenge.challengeId,
      message: `Enter the 6-digit code sent to ${maskEmailAddress(user.email)}.`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
