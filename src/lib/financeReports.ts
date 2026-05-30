import { getPrisma } from "@/lib/prisma";

export type FinanceReportsData = {
  period: {
    from: string | null;
    to: string | null;
  };
  totals: {
    userBalances: number;
    ledgerDebits: number;
    ledgerCredits: number;
    pendingReviewAmount: number;
  };
  transactionsByStatus: Record<string, number>;
  billPaymentsByStatus: Record<string, number>;
  pendingReview: {
    transfers: number;
    billPayments: number;
    transferAmount: number;
    billPaymentAmount: number;
  };
  support: {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  };
  risk: {
    total: number;
    bySeverity: Record<string, number>;
    recentHighSeverity: number;
  };
};

function buildDateRange(from?: string | null, to?: string | null) {
  const range: { gte?: Date; lte?: Date } = {};

  if (from) {
    range.gte = new Date(from);
  }

  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    range.lte = end;
  }

  return Object.keys(range).length > 0 ? range : undefined;
}

export async function getFinanceReports(params?: {
  from?: string | null;
  to?: string | null;
}): Promise<FinanceReportsData> {
  const prisma = getPrisma();
  const createdAt = buildDateRange(params?.from, params?.to);

  const transactionWhere = createdAt ? { createdAt } : {};
  const billPaymentWhere = createdAt ? { createdAt } : {};
  const supportWhere = createdAt ? { createdAt } : {};
  const riskWhere = createdAt ? { createdAt } : {};

  const [
    balanceAggregate,
    ledgerAggregates,
    transactionGroups,
    billPaymentGroups,
    pendingTransfers,
    pendingBillPayments,
    supportGroups,
    supportPriorityGroups,
    supportTotal,
    riskGroups,
    riskTotal,
    recentHighSeverity,
  ] = await Promise.all([
    prisma.account.aggregate({
      where: { status: "ACTIVE" },
      _sum: { balance: true },
    }),
    prisma.ledgerEntry.groupBy({
      by: ["direction"],
      where: createdAt ? { createdAt } : undefined,
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["status"],
      where: transactionWhere,
      _count: { _all: true },
    }),
    prisma.billPayment.groupBy({
      by: ["status"],
      where: billPaymentWhere,
      _count: { _all: true },
    }),
    prisma.transaction.findMany({
      where: { type: "TRANSFER", status: "PENDING" },
      select: { amount: true },
    }),
    prisma.billPayment.findMany({
      where: { status: "PENDING_REVIEW" },
      select: { amount: true },
    }),
    prisma.supportTicket.groupBy({
      by: ["status"],
      where: supportWhere,
      _count: { _all: true },
    }),
    prisma.supportTicket.groupBy({
      by: ["priority"],
      where: supportWhere,
      _count: { _all: true },
    }),
    prisma.supportTicket.count({ where: supportWhere }),
    prisma.riskEvent.groupBy({
      by: ["severity"],
      where: riskWhere,
      _count: { _all: true },
    }),
    prisma.riskEvent.count({ where: riskWhere }),
    prisma.riskEvent.count({
      where: {
        ...riskWhere,
        severity: { in: ["HIGH", "CRITICAL"] },
      },
    }),
  ]);

  const ledgerDebits =
    ledgerAggregates.find((row) => row.direction === "DEBIT")?._sum.amount?.toNumber() ?? 0;
  const ledgerCredits =
    ledgerAggregates.find((row) => row.direction === "CREDIT")?._sum.amount?.toNumber() ?? 0;

  const transferAmount = pendingTransfers.reduce(
    (sum, row) => sum + Math.abs(row.amount.toNumber()),
    0,
  );
  const billPaymentAmount = pendingBillPayments.reduce(
    (sum, row) => sum + row.amount.toNumber(),
    0,
  );

  return {
    period: {
      from: params?.from ?? null,
      to: params?.to ?? null,
    },
    totals: {
      userBalances: balanceAggregate._sum.balance?.toNumber() ?? 0,
      ledgerDebits,
      ledgerCredits,
      pendingReviewAmount: transferAmount + billPaymentAmount,
    },
    transactionsByStatus: Object.fromEntries(
      transactionGroups.map((row) => [row.status, row._count._all]),
    ),
    billPaymentsByStatus: Object.fromEntries(
      billPaymentGroups.map((row) => [row.status, row._count._all]),
    ),
    pendingReview: {
      transfers: pendingTransfers.length,
      billPayments: pendingBillPayments.length,
      transferAmount,
      billPaymentAmount,
    },
    support: {
      total: supportTotal,
      byStatus: Object.fromEntries(supportGroups.map((row) => [row.status, row._count._all])),
      byPriority: Object.fromEntries(
        supportPriorityGroups.map((row) => [row.priority, row._count._all]),
      ),
    },
    risk: {
      total: riskTotal,
      bySeverity: Object.fromEntries(riskGroups.map((row) => [row.severity, row._count._all])),
      recentHighSeverity,
    },
  };
}
