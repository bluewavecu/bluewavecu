import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import { maskAccountNumber } from "@/lib/bankingSerialize";
import { getPrisma } from "@/lib/prisma";
import { enforceRateLimit, rateLimitPresets } from "@/lib/rateLimit";
import { transferSchema } from "@/lib/validators";
import type { PageTransaction } from "@/types/banking";

export const runtime = "nodejs";

function buildTransferDescription(input: {
  recipientName?: string;
  toAccountNumber?: string;
  memo?: string;
}) {
  const recipientLabel = input.recipientName
    ? input.recipientName
    : input.toAccountNumber
      ? `Account ending ${input.toAccountNumber.slice(-4)}`
      : "External recipient";

  if (input.memo) {
    return `Transfer to ${recipientLabel}: ${input.memo}`;
  }

  return `Transfer to ${recipientLabel}`;
}

export async function POST(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Unauthorized", 401);
    }

    const rateLimit = enforceRateLimit(request, "transfers", rateLimitPresets.transfer);

    if (!rateLimit.allowed) {
      return apiError(rateLimit.message, 429);
    }

    const input = transferSchema.parse(await request.json());
    const prisma = getPrisma();

    const account = await prisma.account.findFirst({
      where: {
        id: input.fromAccountId,
        userId: payload.userId,
      },
      select: {
        id: true,
        accountType: true,
        accountNumber: true,
      },
    });

    if (!account) {
      return apiError("Account not found", 404);
    }

    const description = buildTransferDescription(input);
    const merchant = input.recipientName ?? "External transfer";

    const transaction = await prisma.transaction.create({
      data: {
        userId: payload.userId,
        accountId: account.id,
        type: "TRANSFER",
        amount: -Math.abs(input.amount),
        description,
        merchant,
        reference: `TRF-${randomUUID()}`,
        status: "PENDING",
      },
    });

    const masked = maskAccountNumber(account.accountNumber);

    const serializedTransaction: PageTransaction = {
      id: transaction.id,
      accountId: transaction.accountId,
      accountType: account.accountType,
      maskedAccountNumber: masked.masked,
      type: transaction.type,
      amount: transaction.amount.toNumber(),
      description: transaction.description,
      merchant: transaction.merchant,
      reference: transaction.reference,
      status: transaction.status,
      createdAt: transaction.createdAt.toISOString(),
    };

    return apiSuccess(
      {
        transaction: serializedTransaction,
        message: "Transfer request created and pending review.",
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
