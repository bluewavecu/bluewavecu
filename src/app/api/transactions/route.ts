import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveRequestAuth } from "@/lib/requestAuth";

import { maskAccountNumber } from "@/lib/bankingSerialize";
import { getPrisma } from "@/lib/prisma";
import type { PageTransaction, TransactionStatus, TransactionType } from "@/types/banking";

export const runtime = "nodejs";

const transactionStatuses: TransactionStatus[] = [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REVERSED",
];

const transactionTypes: TransactionType[] = [
  "DEPOSIT",
  "WITHDRAWAL",
  "TRANSFER",
  "PAYMENT",
  "CARD",
  "FEE",
  "REFUND",
];

function parseLimit(value: string | null) {
  if (!value) {
    return 100;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return 100;
  }

  return Math.min(parsed, 200);
}

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId") ?? undefined;
    const statusParam = searchParams.get("status");
    const typeParam = searchParams.get("type");
    const cardId = searchParams.get("cardId") ?? undefined;
    const limit = parseLimit(searchParams.get("limit"));

    const status =
      statusParam && transactionStatuses.includes(statusParam as TransactionStatus)
        ? (statusParam as TransactionStatus)
        : undefined;
    const type =
      typeParam && transactionTypes.includes(typeParam as TransactionType)
        ? (typeParam as TransactionType)
        : undefined;

    const transactions = await getPrisma().transaction.findMany({
      where: {
        userId: payload.userId,
        ...(accountId ? { accountId } : {}),
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
        ...(cardId ? { cardId } : {}),
      },
      include: {
        account: {
          select: {
            accountType: true,
            accountNumber: true,
          },
        },
        _count: {
          select: {
            ledgerEntries: true,
          },
        },
      },
      orderBy: [{ postedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
    });

    const serializedTransactions: PageTransaction[] = transactions.map((transaction) => {
      const masked = maskAccountNumber(transaction.account.accountNumber);

      return {
        id: transaction.id,
        accountId: transaction.accountId,
        accountType: transaction.account.accountType,
        maskedAccountNumber: masked.masked,
        type: transaction.type,
        amount: transaction.amount.toNumber(),
        description: transaction.description,
        merchant: transaction.merchant,
        reference: transaction.reference,
        status: transaction.status,
        createdAt: transaction.createdAt.toISOString(),
        postedAt: transaction.postedAt?.toISOString() ?? null,
        reviewedAt: transaction.reviewedAt?.toISOString() ?? null,
        reviewNote: transaction.reviewNote,
        ledgerSummary: {
          entryCount: transaction._count.ledgerEntries,
          posted: Boolean(transaction.postedAt),
        },
      };
    });

    return apiSuccess({ transactions: serializedTransactions });
  } catch (error) {
    return handleApiError(error);
  }
}
