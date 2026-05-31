import { getPrisma } from "@/lib/prisma";

export type ReconciliationAccountRecord = {
  accountId: string;
  accountNumber: string;
  accountType: string;
  userId: string;
  userName: string;
  accountBalance: number;
  ledgerBalance: number;
  delta: number;
  totalDebits: number;
  totalCredits: number;
  status: "MATCH" | "MISMATCH" | "NO_LEDGER";
};

export type ReconciliationSummary = {
  accounts: ReconciliationAccountRecord[];
  totals: {
    accountBalance: number;
    ledgerBalance: number;
    totalDebits: number;
    totalCredits: number;
    mismatchCount: number;
    accountCount: number;
  };
};

export async function calculateAccountLedgerBalance(accountId: string) {
  const prisma = getPrisma();

  const [latestEntry, aggregates] = await Promise.all([
    prisma.ledgerEntry.findFirst({
      where: { accountId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.ledgerEntry.groupBy({
      by: ["direction"],
      where: { accountId },
      _sum: { amount: true },
    }),
  ]);

  const totalDebits =
    aggregates.find((row) => row.direction === "DEBIT")?._sum.amount?.toNumber() ?? 0;
  const totalCredits =
    aggregates.find((row) => row.direction === "CREDIT")?._sum.amount?.toNumber() ?? 0;

  const ledgerBalance = latestEntry ? latestEntry.balanceAfter.toNumber() : 0;

  return {
    ledgerBalance,
    totalDebits,
    totalCredits,
    hasLedgerEntries: Boolean(latestEntry),
  };
}

export async function findAccountBalanceMismatch() {
  const summary = await getReconciliationSummary();
  return summary.accounts.filter((account) => account.status === "MISMATCH");
}

export async function getLedgerTotalsByAccount() {
  const prisma = getPrisma();
  const accounts = await prisma.account.findMany({
    select: { id: true },
  });

  const totals = await Promise.all(
    accounts.map(async (account) => {
      const ledger = await calculateAccountLedgerBalance(account.id);
      return {
        accountId: account.id,
        ...ledger,
      };
    }),
  );

  return totals;
}

export async function getReconciliationSummary(): Promise<ReconciliationSummary> {
  const prisma = getPrisma();

  const accounts = await prisma.account.findMany({
    where: { status: "ACTIVE" },
    include: {
      user: { select: { id: true, fullName: true } },
    },
    orderBy: { accountNumber: "asc" },
  });

  const records: ReconciliationAccountRecord[] = [];

  for (const account of accounts) {
    if (!account.accountNumber) {
      continue;
    }

    const ledger = await calculateAccountLedgerBalance(account.id);
    const accountBalance = account.balance.toNumber();
    const delta = Number((accountBalance - ledger.ledgerBalance).toFixed(2));

    let status: ReconciliationAccountRecord["status"] = "MATCH";

    if (!ledger.hasLedgerEntries && accountBalance !== 0) {
      status = "NO_LEDGER";
    } else if (Math.abs(delta) >= 0.01) {
      status = "MISMATCH";
    }

    records.push({
      accountId: account.id,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      userId: account.userId,
      userName: account.user.fullName,
      accountBalance,
      ledgerBalance: ledger.ledgerBalance,
      delta,
      totalDebits: ledger.totalDebits,
      totalCredits: ledger.totalCredits,
      status,
    });
  }

  return {
    accounts: records,
    totals: {
      accountBalance: records.reduce((sum, row) => sum + row.accountBalance, 0),
      ledgerBalance: records.reduce((sum, row) => sum + row.ledgerBalance, 0),
      totalDebits: records.reduce((sum, row) => sum + row.totalDebits, 0),
      totalCredits: records.reduce((sum, row) => sum + row.totalCredits, 0),
      mismatchCount: records.filter((row) => row.status !== "MATCH").length,
      accountCount: records.length,
    },
  };
}
