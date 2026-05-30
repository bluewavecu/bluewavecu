import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";

export class LedgerError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "LedgerError";
    this.code = code;
  }
}

type PostedTransferSummary = {
  id: string;
  type: "TRANSFER";
  amount: number;
  description: string;
  merchant: string | null;
  reference: string;
  status: "COMPLETED" | "FAILED" | "REVERSED";
  destinationAccountNumber: string | null;
  postedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewNote: string | null;
  createdAt: string;
  ledgerEntries: Array<{
    id: string;
    accountId: string;
    direction: "DEBIT" | "CREDIT";
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description: string;
    createdAt: string;
  }>;
};

function decimal(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}

function hasInsufficientFunds(accountType: "CHECKING" | "SAVINGS" | "CREDIT", balance: number, amount: number) {
  if (accountType === "CREDIT") {
    return false;
  }

  return balance < amount;
}

function serializeLedgerEntry(entry: {
  id: string;
  accountId: string;
  direction: "DEBIT" | "CREDIT";
  amount: { toNumber: () => number };
  balanceBefore: { toNumber: () => number };
  balanceAfter: { toNumber: () => number };
  description: string;
  createdAt: Date;
}) {
  return {
    id: entry.id,
    accountId: entry.accountId,
    direction: entry.direction,
    amount: entry.amount.toNumber(),
    balanceBefore: entry.balanceBefore.toNumber(),
    balanceAfter: entry.balanceAfter.toNumber(),
    description: entry.description,
    createdAt: entry.createdAt.toISOString(),
  };
}

function serializeTransactionSummary(transaction: {
  id: string;
  type: "TRANSFER";
  amount: { toNumber: () => number };
  description: string;
  merchant: string | null;
  reference: string;
  status: "COMPLETED" | "FAILED" | "REVERSED";
  destinationAccountNumber: string | null;
  postedAt: Date | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  reviewNote: string | null;
  createdAt: Date;
  ledgerEntries: Array<{
    id: string;
    accountId: string;
    direction: "DEBIT" | "CREDIT";
    amount: { toNumber: () => number };
    balanceBefore: { toNumber: () => number };
    balanceAfter: { toNumber: () => number };
    description: string;
    createdAt: Date;
  }>;
}): PostedTransferSummary {
  return {
    id: transaction.id,
    type: transaction.type,
    amount: transaction.amount.toNumber(),
    description: transaction.description,
    merchant: transaction.merchant,
    reference: transaction.reference,
    status: transaction.status,
    destinationAccountNumber: transaction.destinationAccountNumber,
    postedAt: transaction.postedAt?.toISOString() ?? null,
    reviewedAt: transaction.reviewedAt?.toISOString() ?? null,
    reviewedBy: transaction.reviewedBy,
    reviewNote: transaction.reviewNote,
    createdAt: transaction.createdAt.toISOString(),
    ledgerEntries: transaction.ledgerEntries.map(serializeLedgerEntry),
  };
}

export async function postApprovedTransferTransaction(params: {
  transactionId: string;
  adminId: string;
  reviewNote?: string;
}) {
  const prisma = getPrisma();

  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUnique({
      where: { id: params.transactionId },
      include: {
        account: true,
        user: true,
        ledgerEntries: true,
      },
    });

    if (!transaction) {
      throw new LedgerError("Transaction not found", "NOT_FOUND");
    }

    if (transaction.type !== "TRANSFER") {
      throw new LedgerError("Only transfer transactions can be posted", "INVALID_TYPE");
    }

    if (transaction.status !== "PENDING") {
      throw new LedgerError("Only pending transfer transactions can be approved", "INVALID_STATUS");
    }

    if (transaction.postedAt) {
      throw new LedgerError("Transaction has already been posted", "ALREADY_POSTED");
    }

    if (transaction.ledgerEntries.length > 0) {
      throw new LedgerError("Ledger entries already exist for this transaction", "DUPLICATE_LEDGER");
    }

    const transferAmount = Math.abs(transaction.amount.toNumber());

    if (transferAmount <= 0) {
      throw new LedgerError("Transfer amount must be greater than zero", "INVALID_AMOUNT");
    }

    const sourceAccount = transaction.account;
    const sourceBalance = sourceAccount.balance.toNumber();
    const sourceAvailable = sourceAccount.availableBalance.toNumber();

    if (
      hasInsufficientFunds(sourceAccount.accountType, sourceAvailable, transferAmount) ||
      hasInsufficientFunds(sourceAccount.accountType, sourceBalance, transferAmount)
    ) {
      throw new LedgerError("Insufficient funds in source account", "INSUFFICIENT_FUNDS");
    }

    const balanceAfterDebit = sourceBalance - transferAmount;
    const availableAfterDebit = sourceAvailable - transferAmount;

    if (hasInsufficientFunds(sourceAccount.accountType, balanceAfterDebit, 0)) {
      throw new LedgerError("Insufficient funds in source account", "INSUFFICIENT_FUNDS");
    }

    const destinationAccount = transaction.destinationAccountNumber
      ? await tx.account.findUnique({
          where: { accountNumber: transaction.destinationAccountNumber },
        })
      : null;

    const debitDescription = destinationAccount
      ? transaction.description
      : `External transfer review/posting simulation: ${transaction.description}`;

    await tx.account.update({
      where: { id: sourceAccount.id },
      data: {
        balance: decimal(balanceAfterDebit),
        availableBalance: decimal(availableAfterDebit),
      },
    });

    await tx.ledgerEntry.create({
      data: {
        transactionId: transaction.id,
        accountId: sourceAccount.id,
        userId: transaction.userId,
        direction: "DEBIT",
        amount: decimal(transferAmount),
        currency: sourceAccount.currency,
        balanceBefore: decimal(sourceBalance),
        balanceAfter: decimal(balanceAfterDebit),
        description: debitDescription,
      },
    });

    if (destinationAccount) {
      const destinationBalance = destinationAccount.balance.toNumber();
      const destinationAvailable = destinationAccount.availableBalance.toNumber();
      const balanceAfterCredit = destinationBalance + transferAmount;
      const availableAfterCredit = destinationAvailable + transferAmount;

      await tx.account.update({
        where: { id: destinationAccount.id },
        data: {
          balance: decimal(balanceAfterCredit),
          availableBalance: decimal(availableAfterCredit),
        },
      });

      await tx.ledgerEntry.create({
        data: {
          transactionId: transaction.id,
          accountId: destinationAccount.id,
          userId: destinationAccount.userId,
          direction: "CREDIT",
          amount: decimal(transferAmount),
          currency: destinationAccount.currency,
          balanceBefore: decimal(destinationBalance),
          balanceAfter: decimal(balanceAfterCredit),
          description: `Transfer credit from ${transaction.reference}`,
        },
      });
    }

    const reviewedAt = new Date();

    const updated = await tx.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "COMPLETED",
        postedAt: reviewedAt,
        reviewedAt,
        reviewedBy: params.adminId,
        reviewNote: params.reviewNote?.trim() || null,
      },
      include: {
        ledgerEntries: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return serializeTransactionSummary({
      ...updated,
      type: "TRANSFER",
      status: "COMPLETED",
    });
  });
}

export async function failReviewedTransferTransaction(params: {
  transactionId: string;
  adminId: string;
  status: "FAILED" | "REVERSED";
  reviewNote?: string;
}) {
  const prisma = getPrisma();

  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUnique({
      where: { id: params.transactionId },
      include: {
        ledgerEntries: true,
      },
    });

    if (!transaction) {
      throw new LedgerError("Transaction not found", "NOT_FOUND");
    }

    if (transaction.type !== "TRANSFER") {
      throw new LedgerError("Only transfer transactions can be reviewed", "INVALID_TYPE");
    }

    if (transaction.status !== "PENDING") {
      throw new LedgerError("Only pending transfer transactions can be reviewed", "INVALID_STATUS");
    }

    if (transaction.postedAt || transaction.ledgerEntries.length > 0) {
      throw new LedgerError("Posted transactions cannot be failed or reversed here", "ALREADY_POSTED");
    }

    const reviewedAt = new Date();

    const updated = await tx.transaction.update({
      where: { id: transaction.id },
      data: {
        status: params.status,
        reviewedAt,
        reviewedBy: params.adminId,
        reviewNote: params.reviewNote?.trim() || null,
      },
      include: {
        ledgerEntries: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return serializeTransactionSummary({
      ...updated,
      type: "TRANSFER",
      status: params.status,
    });
  });
}

export type { PostedTransferSummary };
