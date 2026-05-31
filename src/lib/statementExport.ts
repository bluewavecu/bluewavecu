import { maskAccountNumber } from "@/lib/bankingSerialize";
import { getPrisma } from "@/lib/prisma";
import type { StatementPeriod } from "@/lib/statementPeriod";

export type { StatementPeriod } from "@/lib/statementPeriod";
export {
  STATEMENT_MAX_PERIOD,
  STATEMENT_MIN_PERIOD,
  buildStatementMonthOptions,
  formatStatementPeriodLabel,
  getDefaultStatementPeriodValue,
  isPeriodInAllowedRange,
  parseStatementPeriodValue,
  resolveStatementPeriod,
} from "@/lib/statementPeriod";

export type StatementRow = {
  date: string;
  description: string;
  type: string;
  amount: number;
  status: string;
  balanceAfter: number | null;
  maskedAccount: string;
};

export type StatementExportData = {
  memberName: string;
  period: StatementPeriod;
  accountLabel: string;
  rows: StatementRow[];
  openingBalance: number | null;
  closingBalance: number | null;
  totalInflow: number;
  totalOutflow: number;
};

export function parseStatementMonth(value: string | null) {
  if (!value) {
    return new Date().getMonth() + 1;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 1 || parsed > 12) {
    return null;
  }

  return parsed;
}

export function parseStatementYear(value: string | null) {
  if (!value) {
    return new Date().getFullYear();
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 2000 || parsed > 2100) {
    return null;
  }

  return parsed;
}

export async function fetchStatementExportData(params: {
  userId: string;
  accountId?: string;
  period: StatementPeriod;
}): Promise<StatementExportData> {
  const prisma = getPrisma();
  const periodStart = new Date(Date.UTC(params.period.startYear, params.period.startMonth - 1, 1));
  const periodEnd = new Date(Date.UTC(params.period.endYear, params.period.endMonth, 1));

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { fullName: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  let accountLabel = "All accounts";

  if (params.accountId) {
    const account = await prisma.account.findFirst({
      where: {
        id: params.accountId,
        userId: params.userId,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    accountLabel = maskAccountNumber(account.accountNumber).masked;
  }

  const ledgerEntries = await prisma.ledgerEntry.findMany({
    where: {
      userId: params.userId,
      ...(params.accountId ? { accountId: params.accountId } : {}),
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
      transaction: {
        select: {
          type: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: params.userId,
      ...(params.accountId ? { accountId: params.accountId } : {}),
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

  const rows: StatementRow[] = [];

  for (const entry of ledgerEntries) {
    const masked = maskAccountNumber(entry.account.accountNumber);
    const signedAmount =
      entry.direction === "DEBIT"
        ? -entry.amount.toNumber()
        : entry.amount.toNumber();

    rows.push({
      date: entry.createdAt.toISOString().slice(0, 10),
      description: entry.description,
      type: entry.transaction.type,
      amount: signedAmount,
      status: entry.transaction.status,
      balanceAfter: entry.balanceAfter.toNumber(),
      maskedAccount: masked.masked,
    });
  }

  for (const transaction of transactions) {
    const masked = maskAccountNumber(transaction.account.accountNumber);

    rows.push({
      date: transaction.createdAt.toISOString().slice(0, 10),
      description: transaction.description,
      type: transaction.type,
      amount: transaction.amount.toNumber(),
      status: transaction.status,
      balanceAfter: null,
      maskedAccount: masked.masked,
    });
  }

  rows.sort((left, right) => left.date.localeCompare(right.date));

  const openingEntry = await prisma.ledgerEntry.findFirst({
    where: {
      userId: params.userId,
      ...(params.accountId ? { accountId: params.accountId } : {}),
      createdAt: { lt: periodStart },
    },
    orderBy: { createdAt: "desc" },
  });

  const closingEntry = await prisma.ledgerEntry.findFirst({
    where: {
      userId: params.userId,
      ...(params.accountId ? { accountId: params.accountId } : {}),
      createdAt: { lt: periodEnd },
    },
    orderBy: { createdAt: "desc" },
  });

  let totalInflow = 0;
  let totalOutflow = 0;

  for (const row of rows) {
    if (row.amount > 0) {
      totalInflow += row.amount;
    } else if (row.amount < 0) {
      totalOutflow += Math.abs(row.amount);
    }
  }

  return {
    memberName: user.fullName,
    period: params.period,
    accountLabel,
    rows,
    openingBalance: openingEntry ? openingEntry.balanceAfter.toNumber() : null,
    closingBalance: closingEntry ? closingEntry.balanceAfter.toNumber() : null,
    totalInflow,
    totalOutflow,
  };
}

export function escapeCsvValue(value: string | number) {
  const stringValue = String(value);

  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}

export function statementDataToCsv(data: StatementExportData) {
  const header = [
    "Date",
    "Description",
    "Inflow",
    "Outflow",
    "Balance",
    "Status",
    "Account",
  ];

  const body = data.rows.map((row) => [
    row.date,
    row.description,
    row.amount > 0 ? row.amount.toFixed(2) : "",
    row.amount < 0 ? Math.abs(row.amount).toFixed(2) : "",
    row.balanceAfter !== null ? row.balanceAfter.toFixed(2) : "",
    row.status,
    row.maskedAccount,
  ]);

  return [header, ...body]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
}

export function buildStatementFilename(params: {
  format: "csv" | "pdf";
  period: StatementPeriod;
  accountLabel?: string;
}) {
  const startPart = `${params.period.startYear}-${String(params.period.startMonth).padStart(2, "0")}`;
  const endPart = `${params.period.endYear}-${String(params.period.endMonth).padStart(2, "0")}`;
  const periodPart = startPart === endPart ? startPart : `${startPart}_to_${endPart}`;
  const accountPart = params.accountLabel
    ? params.accountLabel.replaceAll("*", "").replaceAll(" ", "").trim()
    : "all";

  return `bluewave-statement-${accountPart}-${periodPart}.${params.format}`;
}
