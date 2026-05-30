import { NextRequest } from "next/server";
import { logAdminAction, requireAdmin } from "@/lib/admin";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { maskAccountNumber } from "@/lib/bankingSerialize";
import {
  sendAdminAlertEmail,
  sendTransferStatusEmail,
} from "@/lib/email";
import { getPrisma } from "@/lib/prisma";
import { adminUpdateTransactionStatusSchema } from "@/lib/validators";
import type { AdminTransactionRecord, TransactionStatus, TransactionType } from "@/types/banking";

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

function serializeTransaction(transaction: {
  id: string;
  type: TransactionType;
  amount: { toNumber: () => number };
  description: string;
  merchant: string | null;
  reference: string;
  status: TransactionStatus;
  createdAt: Date;
  user: { id: string; fullName: string; email: string };
  account: { id: string; accountType: AdminTransactionRecord["account"]["accountType"]; accountNumber: string };
}): AdminTransactionRecord {
  const masked = maskAccountNumber(transaction.account.accountNumber);

  return {
    id: transaction.id,
    type: transaction.type,
    amount: transaction.amount.toNumber(),
    description: transaction.description,
    merchant: transaction.merchant,
    reference: transaction.reference,
    status: transaction.status,
    createdAt: transaction.createdAt.toISOString(),
    user: transaction.user,
    account: {
      id: transaction.account.id,
      accountType: transaction.account.accountType,
      maskedAccountNumber: masked.masked,
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const typeParam = searchParams.get("type");

    const status =
      statusParam && transactionStatuses.includes(statusParam as TransactionStatus)
        ? (statusParam as TransactionStatus)
        : undefined;
    const type =
      typeParam && transactionTypes.includes(typeParam as TransactionType)
        ? (typeParam as TransactionType)
        : undefined;

    const transactions = await getPrisma().transaction.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        account: { select: { id: true, accountType: true, accountNumber: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return apiSuccess({
      transactions: transactions.map(serializeTransaction),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const input = adminUpdateTransactionStatusSchema.parse(await request.json());
    const prisma = getPrisma();

    const existing = await prisma.transaction.findUnique({
      where: { id: input.transactionId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        account: { select: { id: true, accountType: true, accountNumber: true } },
      },
    });

    if (!existing) {
      return apiError("Transaction not found", 404);
    }

    if (existing.status !== "PENDING") {
      return apiError("Only pending transactions can be updated", 400);
    }

    const reviewStatuses: Array<Extract<TransactionStatus, "COMPLETED" | "FAILED" | "REVERSED">> = [
      "COMPLETED",
      "FAILED",
      "REVERSED",
    ];

    if (!reviewStatuses.includes(input.status)) {
      return apiError("Invalid review status for pending transaction", 400);
    }

    if (existing.type !== "TRANSFER") {
      return apiError("Only pending transfer transactions can be reviewed", 400);
    }

    const updated = await prisma.transaction.update({
      where: { id: input.transactionId },
      data: { status: input.status },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        account: { select: { id: true, accountType: true, accountNumber: true } },
      },
    });

    await logAdminAction({
      adminId: auth.admin.id,
      action: "UPDATE_TRANSACTION_STATUS",
      entityType: "Transaction",
      entityId: updated.id,
      details: {
        previousStatus: existing.status,
        nextStatus: updated.status,
        reference: updated.reference,
        userEmail: updated.user.email,
      },
    });

    void sendTransferStatusEmail({
      email: updated.user.email,
      fullName: updated.user.fullName,
      amount: updated.amount.toNumber(),
      reference: updated.reference,
      description: updated.description,
      status: updated.status as "COMPLETED" | "FAILED" | "REVERSED",
    });

    if (input.status === "COMPLETED" || input.status === "FAILED") {
      void sendAdminAlertEmail({
        subject: `Transfer review ${input.status === "COMPLETED" ? "approved" : "declined"}`,
        message: `${updated.user.fullName}'s transfer ${updated.reference} was marked ${input.status}.`,
        idempotencyKey: `admin-alert/transfer-review/${updated.reference}/${input.status}`,
      });
    }

    return apiSuccess({ transaction: serializeTransaction(updated) });
  } catch (error) {
    return handleApiError(error);
  }
}
