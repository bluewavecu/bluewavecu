import {
  formatAccountNumberForDisplay,
  maskAccountNumber,
} from "@/lib/bankingSerialize";
import { getShareAccountLabel } from "@/lib/institution";
import { getPrisma } from "@/lib/prisma";
import { buildTransactionReceiptFilename } from "@/lib/transactionDisplay";

export { buildTransactionReceiptFilename };

export type TransactionReceiptData = {
  transactionId: string;
  reference: string;
  memberName: string;
  memberEmail: string;
  accountLabel: string;
  maskedAccountNumber: string;
  type: string;
  status: string;
  amount: number;
  description: string;
  merchant: string | null;
  destinationAccountNumber: string | null;
  createdAt: string;
  postedAt: string | null;
  reviewedAt: string | null;
};

export class TransactionReceiptError extends Error {
  status: number;

  constructor(message: string, status = 404) {
    super(message);
    this.name = "TransactionReceiptError";
    this.status = status;
  }
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatType(type: string) {
  return type
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function fetchTransactionReceiptData(params: {
  userId: string;
  transactionId: string;
}): Promise<TransactionReceiptData> {
  const transaction = await getPrisma().transaction.findFirst({
    where: {
      id: params.transactionId,
      userId: params.userId,
    },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
        },
      },
      account: {
        select: {
          accountType: true,
          accountNumber: true,
        },
      },
    },
  });

  if (!transaction) {
    throw new TransactionReceiptError("Transaction not found", 404);
  }

  const masked = maskAccountNumber(transaction.account.accountNumber);
  const accountNumber = transaction.account.accountNumber ?? "";

  return {
    transactionId: transaction.id,
    reference: transaction.reference,
    memberName: transaction.user.fullName,
    memberEmail: transaction.user.email,
    accountLabel: getShareAccountLabel(transaction.account.accountType),
    maskedAccountNumber: accountNumber
      ? formatAccountNumberForDisplay(accountNumber)
      : masked.masked,
    type: formatType(transaction.type),
    status: formatStatus(transaction.status),
    amount: transaction.amount.toNumber(),
    description: transaction.description,
    merchant: transaction.merchant,
    destinationAccountNumber: transaction.destinationAccountNumber,
    createdAt: transaction.createdAt.toISOString(),
    postedAt: transaction.postedAt?.toISOString() ?? null,
    reviewedAt: transaction.reviewedAt?.toISOString() ?? null,
  };
}

