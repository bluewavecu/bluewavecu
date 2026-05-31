import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveRequestAuth } from "@/lib/requestAuth";
import { writeSecurityEvent } from "@/lib/eventLog";
import { getPrisma } from "@/lib/prisma";
import { enforceRateLimit, rateLimitPresets } from "@/lib/rateLimit";
import { setUserTransactionPin } from "@/lib/transactionOtp";
import { verifyTransactionPinResetChallenge } from "@/lib/transactionPinReset";
import { transactionPinResetSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }

    const rateLimit = enforceRateLimit(
      request,
      `transaction-pin-reset-submit-${auth.payload.userId}`,
      rateLimitPresets.verifyEmail,
    );

    if (!rateLimit.allowed) {
      return apiError(rateLimit.message, 429);
    }

    const input = transactionPinResetSchema.parse(await request.json());

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: auth.payload.userId },
      select: {
        id: true,
        role: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt || user.role !== "USER") {
      return apiError("Unauthorized", 401);
    }

    const verification = await verifyTransactionPinResetChallenge({
      userId: user.id,
      challengeId: input.challengeId,
      otpCode: input.otpCode,
    });

    if (!verification.ok) {
      return apiError(verification.message, 400);
    }

    await setUserTransactionPin({
      userId: user.id,
      pin: input.transactionPin,
    });

    void writeSecurityEvent({
      eventType: "TRANSACTION_PIN_RESET",
      actorId: user.id,
      entityId: user.id,
      message: "Member updated their transaction PIN after email verification.",
      severity: "INFO",
    });

    return apiSuccess({
      message: "Your transaction PIN was updated successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
