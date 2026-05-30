import { NextRequest } from "next/server";
import { apiError, handleApiError } from "@/lib/api";
import { getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import { maskAccountNumber } from "@/lib/bankingSerialize";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

function escapeCsvValue(value: string | number) {
  const stringValue = String(value);

  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}

function parseMonth(value: string | null) {
  if (!value) {
    return new Date().getMonth() + 1;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 1 || parsed > 12) {
    return null;
  }

  return parsed;
}

function parseYear(value: string | null) {
  if (!value) {
    return new Date().getFullYear();
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 2000 || parsed > 2100) {
    return null;
  }

  return parsed;
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
    const month = parseMonth(searchParams.get("month"));
    const year = parseYear(searchParams.get("year"));

    if (month === null || year === null) {
      return apiError("Invalid month or year", 400);
    }

    const prisma = getPrisma();
    const periodStart = new Date(Date.UTC(year, month - 1, 1));
    const periodEnd = new Date(Date.UTC(year, month, 1));

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

    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where: {
        userId: payload.userId,
        ...(accountId ? { accountId } : {}),
        createdAt: {
          gte: periodStart,
          lt: periodEnd,
        },
      },
      include: {
        account: {
          select: {
            accountNumber: true,
            accountType: true,
          },
        },
        transaction: {
          select: {
            type: true,
            status: true,
            reference: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: payload.userId,
        ...(accountId ? { accountId } : {}),
        postedAt: null,
        createdAt: {
          gte: periodStart,
          lt: periodEnd,
        },
      },
      include: {
        account: {
          select: {
            accountNumber: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const rows: string[][] = [
      ["Date", "Description", "Type", "Amount", "Status", "Balance After", "Account"],
    ];

    for (const entry of ledgerEntries) {
      const masked = maskAccountNumber(entry.account.accountNumber);
      const signedAmount =
        entry.direction === "DEBIT"
          ? -entry.amount.toNumber()
          : entry.amount.toNumber();

      rows.push([
        entry.createdAt.toISOString().slice(0, 10),
        entry.description,
        entry.transaction.type,
        signedAmount.toFixed(2),
        entry.transaction.status,
        entry.balanceAfter.toNumber().toFixed(2),
        masked.masked,
      ]);
    }

    for (const transaction of transactions) {
      const masked = maskAccountNumber(transaction.account.accountNumber);

      rows.push([
        transaction.createdAt.toISOString().slice(0, 10),
        transaction.description,
        transaction.type,
        transaction.amount.toNumber().toFixed(2),
        transaction.status,
        "",
        masked.masked,
      ]);
    }

    rows.sort((left, right) => left[0].localeCompare(right[0]));

    const csv = rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
    const filename = `bluewave-statement-${year}-${String(month).padStart(2, "0")}.csv`;

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
