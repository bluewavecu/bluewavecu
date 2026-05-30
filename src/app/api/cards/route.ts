import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import {
  getAccountDisplayName,
  maskAccountNumber,
} from "@/lib/bankingSerialize";
import { getPrisma } from "@/lib/prisma";
import type { PageCard } from "@/types/banking";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Unauthorized", 401);
    }

    const cards = await getPrisma().card.findMany({
      where: { userId: payload.userId },
      include: {
        account: {
          select: {
            id: true,
            accountType: true,
            accountNumber: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const serializedCards: PageCard[] = cards.map((card) => {
      const masked = maskAccountNumber(card.account.accountNumber);

      return {
        id: card.id,
        accountId: card.accountId,
        cardType: card.cardType,
        last4: card.last4,
        cardholderName: card.cardholderName,
        status: card.status,
        spendingLimit: card.spendingLimit.toNumber(),
        linkedAccount: {
          id: card.account.id,
          accountType: card.account.accountType,
          displayName: getAccountDisplayName(card.account.accountType),
          maskedAccountNumber: masked.masked,
        },
        createdAt: card.createdAt.toISOString(),
        updatedAt: card.updatedAt.toISOString(),
      };
    });

    return apiSuccess({ cards: serializedCards });
  } catch (error) {
    return handleApiError(error);
  }
}
