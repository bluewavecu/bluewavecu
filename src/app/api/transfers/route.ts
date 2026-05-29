import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { transferSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Authentication required", 401);
    }

    const input = transferSchema.parse(await request.json());
    const prisma = getPrisma();

    const account = await prisma.account.findFirst({
      where: {
        id: input.accountId,
        userId: payload.userId,
      },
    });

    if (!account) {
      return apiError("Account not found", 404);
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: payload.userId,
        accountId: account.id,
        type: "TRANSFER",
        amount: input.amount,
        description: input.description,
        merchant: input.merchant,
        reference: `TRF-${randomUUID()}`,
        status: "PENDING",
      },
    });

    return apiSuccess(
      {
        transaction: {
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
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
