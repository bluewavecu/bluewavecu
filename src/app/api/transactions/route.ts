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

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId") ?? undefined;

    const transactions = await getPrisma().transaction.findMany({
      where: {
        userId: payload.userId,
        ...(accountId ? { accountId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return apiSuccess({
      transactions: transactions.map((transaction) => ({
        id: transaction.id,
        userId: transaction.userId,
        accountId: transaction.accountId,
        type: transaction.type,
        amount: transaction.amount.toNumber(),
        description: transaction.description,
        merchant: transaction.merchant,
        reference: transaction.reference,
        status: transaction.status,
        createdAt: transaction.createdAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
