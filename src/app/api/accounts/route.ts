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

    const accounts = await getPrisma().account.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: "asc" },
    });

    return apiSuccess({
      accounts: accounts.map((account) => ({
        id: account.id,
        userId: account.userId,
        accountType: account.accountType,
        accountNumber: account.accountNumber,
        routingNumber: account.routingNumber,
        balance: account.balance.toNumber(),
        availableBalance: account.availableBalance.toNumber(),
        currency: account.currency,
        status: account.status,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
