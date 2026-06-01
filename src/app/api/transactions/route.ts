import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveRequestAuth } from "@/lib/requestAuth";

import { formatAccountNumberForDisplay, maskAccountNumber } from "@/lib/bankingSerialize";
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

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 50;

function parsePage(value: string | null) {
  if (!value) {
    return 1;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function parseLimit(value: string | null) {
  if (!value) {
    return DEFAULT_PAGE_SIZE;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(parsed, MAX_PAGE_SIZE);
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
    const page = parsePage(searchParams.get("page"));
    const pageSize = parseLimit(searchParams.get("limit"));
    const searchQuery = searchParams.get("q")?.trim() ?? "";

    const status =
      statusParam && transactionStatuses.includes(statusParam as TransactionStatus)
        ? (statusParam as TransactionStatus)
        : undefined;
    const type =
      typeParam && transactionTypes.includes(typeParam as TransactionType)
        ? (typeParam as TransactionType)
        : undefined;

    const where = {
      userId: payload.userId,
      ...(accountId ? { accountId } : {}),
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
      ...(cardId ? { cardId } : {}),
      ...(searchQuery
        ? {
            OR: [
              { description: { contains: searchQuery, mode: "insensitive" as const } },
              { merchant: { contains: searchQuery, mode: "insensitive" as const } },
              { reference: { contains: searchQuery, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const skip = (page - 1) * pageSize;

    const [transactions, total] = await Promise.all([
      getPrisma().transaction.findMany({
        where,
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
        skip,
        take: pageSize,
      }),
      getPrisma().transaction.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const serializedTransactions: PageTransaction[] = transactions.map((transaction) => {
      const masked = maskAccountNumber(transaction.account.accountNumber);
      const accountNumber = transaction.account.accountNumber ?? "";

      return {
        id: transaction.id,
        accountId: transaction.accountId,
        accountType: transaction.account.accountType,
        maskedAccountNumber: accountNumber
          ? formatAccountNumberForDisplay(accountNumber)
          : masked.masked,
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

    return apiSuccess({
      transactions: serializedTransactions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
