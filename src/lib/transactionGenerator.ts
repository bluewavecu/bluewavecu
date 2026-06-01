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
  if (!Number.isFinite(value)) {
    throw new TransactionGeneratorError("Invalid amount calculated for transaction.", "INVALID_AMOUNT");
  }

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

type MixDirection = "CREDIT" | "DEBIT";

const MIX_PATTERNS: MixDirection[][] = [
  ["CREDIT", "DEBIT"],
  ["DEBIT", "CREDIT"],
  ["CREDIT", "CREDIT", "DEBIT"],
  ["CREDIT", "DEBIT", "DEBIT"],
  ["CREDIT", "CREDIT", "DEBIT", "DEBIT"],
  ["CREDIT", "CREDIT", "CREDIT", "DEBIT", "DEBIT"],
  ["DEBIT", "DEBIT", "CREDIT"],
  ["CREDIT", "DEBIT", "CREDIT"],
  ["DEBIT", "CREDIT", "DEBIT"],
];

function buildMixedDirectionSequence(creditCount: number, debitCount: number) {
  let creditsLeft = creditCount;
  let debitsLeft = debitCount;
  const sequence: MixDirection[] = [];

  while (creditsLeft > 0 || debitsLeft > 0) {
    const pattern = pickRandom(MIX_PATTERNS);
    let added = 0;

    for (const direction of pattern) {
      if (direction === "CREDIT" && creditsLeft > 0) {
        sequence.push("CREDIT");
        creditsLeft -= 1;
        added += 1;
      } else if (direction === "DEBIT" && debitsLeft > 0) {
        sequence.push("DEBIT");
        debitsLeft -= 1;
        added += 1;
      }
    }

    if (added === 0) {
      if (creditsLeft > 0) {
        sequence.push("CREDIT");
        creditsLeft -= 1;
      } else if (debitsLeft > 0) {
        sequence.push("DEBIT");
        debitsLeft -= 1;
      }
    }
  }

  return sequence;
}

function interleaveDrafts(credits: GeneratedDraft[], debits: GeneratedDraft[]) {
  const sequence = buildMixedDirectionSequence(credits.length, debits.length);
  const creditQueue = [...credits];
  const debitQueue = [...debits];
  const mixed: GeneratedDraft[] = [];

  for (const direction of sequence) {
    if (direction === "CREDIT" && creditQueue.length > 0) {
      mixed.push(creditQueue.shift()!);
    } else if (direction === "DEBIT" && debitQueue.length > 0) {
      mixed.push(debitQueue.shift()!);
    }
  }

  while (creditQueue.length > 0) {
    mixed.push(creditQueue.shift()!);
  }

  while (debitQueue.length > 0) {
    mixed.push(debitQueue.shift()!);
  }

  return mixed;
}

function assignSpreadDates(drafts: GeneratedDraft[], fromDate: Date, toDate: Date) {
  if (drafts.length === 0) {
    return;
  }

  const start = fromDate.getTime();
  const end = toDate.getTime();
  const span = Math.max(end - start, 1);

  drafts.forEach((draft, index) => {
    const ratio = drafts.length === 1 ? 0.5 : index / (drafts.length - 1);
    const base = start + Math.floor(span * ratio);
    const jitterMs = Math.floor((Math.random() - 0.5) * 6 * 60 * 60 * 1000);
    const at = Math.min(end, Math.max(start, base + jitterMs));
    draft.effectiveAt = new Date(at);
  });

  for (let index = 1; index < drafts.length; index += 1) {
    const previous = drafts[index - 1]!;
    const current = drafts[index]!;

    if (current.effectiveAt.getTime() < previous.effectiveAt.getTime()) {
      current.effectiveAt = new Date(previous.effectiveAt.getTime() + 60_000);
    }
  }
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
  payrollCompanyName?: string;
  activityCities?: string;
  payrollPaycheckMin?: number;
  payrollPaycheckMax?: number;
  includeCardAndUtilityActivity?: boolean;
};

function parseActivityCities(raw?: string) {
  if (!raw?.trim()) {
    return ["Dallas, TX", "Plano, TX", "Irving, TX"];
  }

  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function buildBiweeklyPayrollDates(from: Date, to: Date) {
  const dates: Date[] = [];
  const cursor = new Date(from);
  cursor.setHours(9, 0, 0, 0);

  while (cursor.getTime() <= to.getTime()) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 14);
  }

  return dates;
}

function buildPayrollDraft(
  companyName: string,
  effectiveAt: Date,
  paycheckRange?: { min?: number; max?: number },
): GeneratedDraft {
  const min = paycheckRange?.min && paycheckRange.min > 0 ? paycheckRange.min : 900;
  const max =
    paycheckRange?.max && paycheckRange.max >= min ? paycheckRange.max : Math.max(min + 100, 3800);

  return {
    type: "DEPOSIT",
    amount: randomAmount(min, max),
    description: "Payroll deposit",
    merchant: companyName,
    effectiveAt,
    direction: "CREDIT",
  };
}

function buildContextualDebitDraft(
  template: TransactionTemplate,
  cities: string[],
  effectiveAt: Date,
): GeneratedDraft {
  const city = pickRandom(cities);
  const merchant = `${pickRandom(template.merchants)} · ${city}`;

  return {
    type: template.type,
    amount: -randomAmount(8, 420),
    description: pickRandom(template.descriptions),
    merchant,
    effectiveAt,
    direction: "DEBIT",
  };
}

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

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  if (params.toDate > endOfToday) {
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

  const payrollCompany = params.payrollCompanyName?.trim() || "Employer Payroll";
  const cities = parseActivityCities(params.activityCities);
  const includeRetail = params.includeCardAndUtilityActivity !== false;
  const paycheckRange = {
    min: params.payrollPaycheckMin,
    max: params.payrollPaycheckMax,
  };
  const payrollDates = buildBiweeklyPayrollDates(params.fromDate, params.toDate);
  const payrollSlots = Math.min(params.creditCount, payrollDates.length);

  const creditDrafts: GeneratedDraft[] = [];
  const debitDrafts: GeneratedDraft[] = [];

  for (let index = 0; index < payrollSlots; index += 1) {
    creditDrafts.push(buildPayrollDraft(payrollCompany, payrollDates[index]!, paycheckRange));
  }

  for (let index = payrollSlots; index < params.creditCount; index += 1) {
    const template = pickRandom(CREDIT_TEMPLATES);
    creditDrafts.push({
      ...buildDraft(template, "CREDIT", params.fromDate),
      description: pickRandom(["Mobile deposit", "ACH deposit", "Interest payment", "Refund"]),
    });
  }

  const debitTemplates = includeRetail
    ? DEBIT_TEMPLATES
    : DEBIT_TEMPLATES.filter((template) => template.type !== "CARD");

  for (let index = 0; index < params.debitCount; index += 1) {
    const template = pickRandom(debitTemplates.length > 0 ? debitTemplates : DEBIT_TEMPLATES);
    debitDrafts.push(
      buildContextualDebitDraft(template, cities, params.fromDate),
    );
  }

  const drafts = interleaveDrafts(creditDrafts, debitDrafts);
  assignSpreadDates(drafts, params.fromDate, params.toDate);

  const existingTransactions = await prisma.transaction.findMany({
    where: {
      accountId: account.id,
      status: "COMPLETED",
      OR: [
        { postedAt: { lte: params.toDate } },
        { postedAt: null, createdAt: { lte: params.toDate } },
      ],
    },
    select: {
      amount: true,
      postedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
    take: 5000,
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
        const maxDebit =
          account.accountType === "CREDIT"
            ? debitAmount
            : Math.max(0, Math.min(debitAmount, runningBalance));

        if (maxDebit < 0.01) {
          continue;
        }

        amount = -Math.round(maxDebit * 100) / 100;
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

  if (inserts.length === 0) {
    throw new TransactionGeneratorError(
      "No transactions could be generated with the current balance and filters.",
      "INVALID_COUNT",
    );
  }

  const netAmount = inserts.reduce((sum, item) => sum + item.draft.amount, 0);
  const closingBalance = priorBalance + netAmount;

  await prisma.$transaction(
    async (tx) => {
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
    },
    {
      maxWait: 15_000,
      timeout: 120_000,
    },
  );

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
