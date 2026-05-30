import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import {
  getAccountDisplayName,
  maskAccountNumber,
} from "@/lib/bankingSerialize";
import { getPrisma } from "@/lib/prisma";
import type { PageAccount } from "@/types/banking";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Unauthorized", 401);
    }

    const accounts = await getPrisma().account.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: "asc" },
    });

    const serializedAccounts: PageAccount[] = accounts.map((account) => {
      const masked = maskAccountNumber(account.accountNumber);

      return {
        id: account.id,
        accountType: account.accountType,
        displayName: getAccountDisplayName(account.accountType),
        maskedAccountNumber: masked.masked,
        accountNumberLast4: masked.last4,
        routingNumber: account.routingNumber,
        balance: account.balance.toNumber(),
        availableBalance: account.availableBalance.toNumber(),
        currency: account.currency,
        status: account.status,
        createdAt: account.createdAt.toISOString(),
        updatedAt: account.updatedAt.toISOString(),
      };
    });

    return apiSuccess({ accounts: serializedAccounts });
  } catch (error) {
    return handleApiError(error);
  }
}
