import { randomUUID } from "crypto";
import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import type { AccountType, TransactionType } from "@/types/banking";

export class TransactionGeneratorError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "TransactionGeneratorError";
    this.code = code;
  }
}

function decimal(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}

function getEffectiveDate(transaction: { postedAt: Date | null; createdAt: Date }) {
  return transaction.postedAt ?? transaction.createdAt;
}

type GeneratedDraft = {
  type: TransactionType;
  amount: number;
  description: string;
  merchant: string;
  effectiveAt: Date;
  direction: "CREDIT" | "DEBIT";
};

type TransactionTemplate = {
  type: TransactionType;
  descriptions: string[];
  merchants: string[];
};

const CREDIT_TEMPLATES: TransactionTemplate[] = [
  {
    type: "DEPOSIT",
    descriptions: ["Direct deposit", "Payroll deposit", "ACH deposit", "Mobile check deposit"],
    merchants: [
      "Texas Instruments Payroll",
      "Dallas ISD Payroll",
      "Bluewave ACH",
      "Member Services",
    ],
  },
  {
    type: "REFUND",
    descriptions: ["Merchant refund", "Purchase reversal", "Returned payment"],
    merchants: ["Kroger", "Oncor Electric Delivery", "AT&T Billing", "NorthPark Center"],
  },
];

const DEBIT_TEMPLATES: TransactionTemplate[] = [
  {
    type: "CARD",
    descriptions: ["Card purchase", "Contactless payment", "Online purchase"],
    merchants: ["Kroger", "QuikTrip", "AT&T Billing", "NorthPark Center"],
  },
  {
    type: "PAYMENT",
    descriptions: ["Bill payment", "Utility payment", "Insurance premium"],
    merchants: ["Oncor Electric Delivery", "City of Dallas Water", "State Farm Insurance"],
  },
  {
    type: "WITHDRAWAL",
    descriptions: ["ATM withdrawal", "Cash withdrawal"],
    merchants: ["Bluewave ATM", "Shared Branch ATM"],
  },
  {
    type: "FEE",
    descriptions: ["Monthly service fee", "Wire fee", "Statement copy fee"],
    merchants: ["Bluewave Credit Union"],
  },
  {
    type: "TRANSFER",
    descriptions: ["Transfer to savings", "Transfer to external account"],
    merchants: ["Bluewave Transfer", "Member Transfer"],
  },
];

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]!;
}

function randomDateInRange(from: Date, to: Date) {
  const start = from.getTime();
  const end = to.getTime();

  if (end <= start) {
    return new Date(start);
  }

  return new Date(start + Math.floor(Math.random() * (end - start + 1)));
}

function randomAmount(min: number, max: number) {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

function buildDraft(
  template: TransactionTemplate,
  direction: "CREDIT" | "DEBIT",
  effectiveAt: Date,
): GeneratedDraft {
  const absoluteAmount = randomAmount(direction === "CREDIT" ? 25 : 5, direction === "CREDIT" ? 2500 : 450);

  return {
    type: template.type,
    amount: direction === "CREDIT" ? absoluteAmount : -absoluteAmount,
    description: pickRandom(template.descriptions),
    merchant: pickRandom(template.merchants),
    effectiveAt,
    direction,
  };
}

function canDebit(accountType: AccountType, runningBalance: number, debitAmount: number) {
  if (accountType === "CREDIT") {
    return true;
  }

  return runningBalance >= debitAmount;
}

export type GenerateTransactionsParams = {
  adminId: string;
  userId: string;
  accountId: string;
  creditCount: number;
  debitCount: number;
  fromDate: Date;
  toDate: Date;
};

export type GenerateTransactionsResult = {
  created: number;
  creditCount: number;
  debitCount: number;
  netAmount: number;
  priorBalance: number;
  closingBalance: number;
  fromDate: string;
  toDate: string;
};

export async function generateAccountTransactions(
  params: GenerateTransactionsParams,
): Promise<GenerateTransactionsResult> {
  const totalRequested = params.creditCount + params.debitCount;

  if (totalRequested < 1) {
    throw new TransactionGeneratorError("Create at least one transaction.", "INVALID_COUNT");
  }

  if (totalRequested > 1000) {
    throw new TransactionGeneratorError("Maximum 1000 transactions per batch.", "INVALID_COUNT");
  }

  const now = new Date();
  const twentyYearsAgo = new Date(now);
  twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20);

  if (params.fromDate < twentyYearsAgo) {
    throw new TransactionGeneratorError("From date cannot be more than 20 years ago.", "INVALID_DATE");
  }

  if (params.fromDate > params.toDate) {
    throw new TransactionGeneratorError("From date must be on or before to date.", "INVALID_DATE");
  }

  if (params.toDate > now) {
    throw new TransactionGeneratorError("To date cannot be in the future.", "INVALID_DATE");
  }

  const prisma = getPrisma();

  const account = await prisma.account.findFirst({
    where: {
      id: params.accountId,
      userId: params.userId,
    },
  });

  if (!account) {
    throw new TransactionGeneratorError("Account not found for member.", "NOT_FOUND");
  }

  const drafts: GeneratedDraft[] = [];

  for (let index = 0; index < params.creditCount; index += 1) {
    drafts.push(
      buildDraft(pickRandom(CREDIT_TEMPLATES), "CREDIT", randomDateInRange(params.fromDate, params.toDate)),
    );
  }

  for (let index = 0; index < params.debitCount; index += 1) {
    drafts.push(
      buildDraft(pickRandom(DEBIT_TEMPLATES), "DEBIT", randomDateInRange(params.fromDate, params.toDate)),
    );
  }

  const existingTransactions = await prisma.transaction.findMany({
    where: {
      accountId: account.id,
      status: "COMPLETED",
    },
    select: {
      amount: true,
      postedAt: true,
      createdAt: true,
    },
  });

  type TimelineEntry =
    | {
        amount: number;
        effectiveAt: Date;
        isNew: false;
      }
    | {
        amount: number;
        effectiveAt: Date;
        isNew: true;
        draft: GeneratedDraft;
      };

  const timeline: TimelineEntry[] = [
    ...existingTransactions.map((transaction) => ({
      amount: transaction.amount.toNumber(),
      effectiveAt: getEffectiveDate(transaction),
      isNew: false as const,
    })),
    ...drafts.map((draft) => ({
      amount: draft.amount,
      effectiveAt: draft.effectiveAt,
      isNew: true as const,
      draft,
    })),
  ];

  timeline.sort((left, right) => left.effectiveAt.getTime() - right.effectiveAt.getTime());

  const priorBalance = account.balance.toNumber();
  const existingSum = existingTransactions.reduce(
    (sum, transaction) => sum + transaction.amount.toNumber(),
    0,
  );
  let runningBalance = priorBalance - existingSum;

  const inserts: Array<{
    draft: GeneratedDraft;
    balanceBefore: number;
    balanceAfter: number;
  }> = [];

  for (const entry of timeline) {
    if (!entry.isNew) {
      runningBalance += entry.amount;
      continue;
    }

    let amount = entry.draft.amount;

    if (amount < 0) {
      const debitAmount = Math.abs(amount);

      if (!canDebit(account.accountType, runningBalance, debitAmount)) {
        const capped = Math.max(0.01, Math.min(debitAmount, runningBalance - 0.01));
        amount = -Math.round(capped * 100) / 100;
      }
    }

    const balanceBefore = runningBalance;
    const balanceAfter = runningBalance + amount;

    inserts.push({
      draft: {
        ...entry.draft,
        amount,
      },
      balanceBefore,
      balanceAfter,
    });

    runningBalance = balanceAfter;
  }

  const netAmount = inserts.reduce((sum, item) => sum + item.draft.amount, 0);
  const closingBalance = priorBalance + netAmount;

  await prisma.$transaction(async (tx) => {
    for (const item of inserts) {
      const reference = `GEN-${randomUUID()}`;
      const transaction = await tx.transaction.create({
        data: {
          userId: params.userId,
          accountId: account.id,
          type: item.draft.type,
          amount: decimal(item.draft.amount),
          description: item.draft.description,
          merchant: item.draft.merchant,
          reference,
          status: "COMPLETED",
          createdAt: item.draft.effectiveAt,
          postedAt: item.draft.effectiveAt,
          reviewedAt: now,
          reviewedBy: params.adminId,
          reviewNote: "Bulk generated by admin",
        },
      });

      await tx.ledgerEntry.create({
        data: {
          transactionId: transaction.id,
          accountId: account.id,
          userId: params.userId,
          direction: item.draft.direction,
          amount: decimal(Math.abs(item.draft.amount)),
          currency: account.currency,
          balanceBefore: decimal(item.balanceBefore),
          balanceAfter: decimal(item.balanceAfter),
          description: `${item.draft.description} (${reference})`,
          createdAt: item.draft.effectiveAt,
        },
      });
    }

    await tx.account.update({
      where: { id: account.id },
      data: {
        balance: decimal(closingBalance),
        availableBalance: decimal(closingBalance),
      },
    });
  });

  return {
    created: inserts.length,
    creditCount: inserts.filter((item) => item.draft.amount > 0).length,
    debitCount: inserts.filter((item) => item.draft.amount < 0).length,
    netAmount,
    priorBalance,
    closingBalance,
    fromDate: params.fromDate.toISOString(),
    toDate: params.toDate.toISOString(),
  };
}
