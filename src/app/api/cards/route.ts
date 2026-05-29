import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Authentication required", 401);
    }

    const cards = await getPrisma().card.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({
      cards: cards.map((card) => ({
        id: card.id,
        userId: card.userId,
        accountId: card.accountId,
        cardType: card.cardType,
        last4: card.last4,
        cardholderName: card.cardholderName,
        status: card.status,
        spendingLimit: card.spendingLimit.toNumber(),
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
