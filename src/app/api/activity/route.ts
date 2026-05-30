import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import { maskAccountNumber } from "@/lib/bankingSerialize";
import { getPrisma } from "@/lib/prisma";
import type { ActivityTimelineData, ActivityTimelineItem } from "@/types/banking";

export const runtime = "nodejs";

function parseLimit(value: string | null) {
  if (!value) {
    return 25;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return 25;
  }

  return Math.min(parsed, 100);
}

export async function GET(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId") ?? undefined;
    const limit = parseLimit(searchParams.get("limit"));
    const prisma = getPrisma();

    if (accountId) {
      const account = await prisma.account.findFirst({
        where: {
          id: accountId,
          userId: payload.userId,
        },
      });

      if (!account) {
        return apiError("Account not found", 404);
      }
    }

    const [ledgerEntries, transactions, supportTickets] = await Promise.all([
      prisma.ledgerEntry.findMany({
        where: {
          userId: payload.userId,
          ...(accountId ? { accountId } : {}),
        },
        include: {
          account: { select: { accountNumber: true, accountType: true } },
          transaction: { select: { reference: true, status: true, type: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.transaction.findMany({
        where: {
          userId: payload.userId,
          ...(accountId ? { accountId } : {}),
        },
        include: {
          account: { select: { accountNumber: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.supportTicket.findMany({
        where: { userId: payload.userId },
        orderBy: { updatedAt: "desc" },
        take: Math.min(limit, 10),
      }),
    ]);

    const items: ActivityTimelineItem[] = [];

    for (const entry of ledgerEntries) {
      const masked = maskAccountNumber(entry.account.accountNumber);

      items.push({
        id: `ledger-${entry.id}`,
        kind: "LEDGER",
        title: entry.direction === "DEBIT" ? "Ledger debit posted" : "Ledger credit posted",
        description: entry.description,
        status: entry.transaction.status,
        amount: entry.direction === "DEBIT" ? -entry.amount.toNumber() : entry.amount.toNumber(),
        direction: entry.direction,
        balanceAfter: entry.balanceAfter.toNumber(),
        maskedAccountNumber: masked.masked,
        reference: entry.transaction.reference,
        createdAt: entry.createdAt.toISOString(),
        href: "/transactions",
      });
    }

    for (const transaction of transactions) {
      if (transaction.postedAt) {
        continue;
      }

      const masked = maskAccountNumber(transaction.account.accountNumber);

      items.push({
        id: `transaction-${transaction.id}`,
        kind: "TRANSACTION",
        title:
          transaction.type === "TRANSFER" && transaction.status === "PENDING"
            ? "Transfer pending review"
            : `${transaction.type.toLowerCase()} activity`,
        description: transaction.description,
        status: transaction.status,
        amount: transaction.amount.toNumber(),
        maskedAccountNumber: masked.masked,
        reference: transaction.reference,
        createdAt: transaction.createdAt.toISOString(),
        href: transaction.type === "TRANSFER" ? "/transfers" : "/transactions",
      });
    }

    for (const ticket of supportTickets) {
      items.push({
        id: `support-${ticket.id}`,
        kind: "SUPPORT",
        title: ticket.subject,
        description: ticket.message.slice(0, 120),
        status: ticket.status,
        createdAt: ticket.updatedAt.toISOString(),
        href: "/support",
      });
    }

    items.sort((left, right) => right.createdAt.localeCompare(left.createdAt));

    const data: ActivityTimelineData = {
      items: items.slice(0, limit),
    };

    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
