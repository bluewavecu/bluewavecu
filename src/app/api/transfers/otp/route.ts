import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveRequestAuth } from "@/lib/requestAuth";
import { getPrisma } from "@/lib/prisma";
import { canUserTransact, getTransactionBlockMessage } from "@/lib/userAccess";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveRequestAuth(request);

    if (!auth.ok) {
      return auth.response;
    }

    const user = await getPrisma().user.findUnique({
      where: { id: auth.payload.userId },
      select: {
        transactionPinHash: true,
        status: true,
        deletedAt: true,
      },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    const transactionBlockMessage = getTransactionBlockMessage({
      status: user.status,
      deletedAt: user.deletedAt,
    });

    if (transactionBlockMessage) {
      return apiError(transactionBlockMessage, 403);
    }

    if (!canUserTransact({ status: user.status, deletedAt: user.deletedAt })) {
      return apiError("Your account cannot initiate transactions.", 403);
    }

    return apiSuccess({
      message: "Transfers are authorized with your transaction PIN only.",
      requiresTransactionPin: true,
      hasTransactionPin: Boolean(user.transactionPinHash),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
