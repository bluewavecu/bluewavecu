import { NextRequest } from "next/server";
import { logAdminAction, requireAdmin } from "@/lib/admin";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { maskAccountNumber } from "@/lib/bankingSerialize";
import {
  sendAdminAlertEmail,
  sendTransferStatusEmail,
} from "@/lib/email";
import { failReviewedTransferTransaction, LedgerError, postApprovedTransferTransaction } from "@/lib/ledger";
import { writeLedgerEvent } from "@/lib/eventLog";
import { createTransferNotification } from "@/lib/notifications";
import { getPrisma } from "@/lib/prisma";
import { applyRiskAssessment, scoreAdminReviewRisk } from "@/lib/risk";
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
  postedAt: Date | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  reviewNote: string | null;
  delayedAt: Date | null;
  destinationAccountNumber: string | null;
  user: { id: string; fullName: string; email: string };
  account: { id: string; accountType: AdminTransactionRecord["account"]["accountType"]; accountNumber: string | null };
  _count?: { ledgerEntries: number };
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
    postedAt: transaction.postedAt?.toISOString() ?? null,
    reviewedAt: transaction.reviewedAt?.toISOString() ?? null,
    reviewedBy: transaction.reviewedBy,
    reviewNote: transaction.reviewNote,
    delayedAt: transaction.delayedAt?.toISOString() ?? null,
    destinationAccountNumber: transaction.destinationAccountNumber,
    ledgerEntryCount: transaction._count?.ledgerEntries,
    user: transaction.user,
    account: {
      id: transaction.account.id,
      accountType: transaction.account.accountType,
      maskedAccountNumber: masked.masked,
    },
  };
}

function handleLedgerError(error: LedgerError) {
  if (error.code === "NOT_FOUND") {
    return apiError(error.message, 404);
  }

  if (error.code === "INSUFFICIENT_FUNDS") {
    return apiError(error.message, 400);
  }

  return apiError(error.message, 400);
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
        _count: { select: { ledgerEntries: true } },
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
        _count: { select: { ledgerEntries: true } },
      },
    });

    if (!existing) {
      return apiError("Transaction not found", 404);
    }

    if (existing.type !== "TRANSFER") {
      return apiError("Only pending transfer transactions can be reviewed", 400);
    }

    let ledgerResult;

    if (input.status === "COMPLETED") {
      try {
        ledgerResult = await postApprovedTransferTransaction({
          transactionId: input.transactionId,
          adminId: auth.admin.id,
          reviewNote: input.reviewNote,
        });
      } catch (error) {
        if (error instanceof LedgerError) {
          return handleLedgerError(error);
        }
        throw error;
      }
    } else {
      try {
        ledgerResult = await failReviewedTransferTransaction({
          transactionId: input.transactionId,
          adminId: auth.admin.id,
          status: input.status,
          reviewNote: input.reviewNote,
        });
      } catch (error) {
        if (error instanceof LedgerError) {
          return handleLedgerError(error);
        }
        throw error;
      }
    }

    await logAdminAction({
      adminId: auth.admin.id,
      action: input.status === "COMPLETED" ? "POST_TRANSFER_LEDGER" : "UPDATE_TRANSACTION_STATUS",
      entityType: "Transaction",
      entityId: ledgerResult.id,
      details: {
        previousStatus: existing.status,
        nextStatus: ledgerResult.status,
        reference: ledgerResult.reference,
        userEmail: existing.user.email,
        reviewNote: input.reviewNote ?? null,
        ledgerEntryCount: ledgerResult.ledgerEntries.length,
      },
    });

    const updated = await prisma.transaction.findUnique({
      where: { id: ledgerResult.id },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        account: { select: { id: true, accountType: true, accountNumber: true } },
        _count: { select: { ledgerEntries: true } },
      },
    });

    if (!updated) {
      return apiError("Transaction not found after review", 404);
    }

    void sendTransferStatusEmail({
      email: existing.user.email,
      fullName: existing.user.fullName,
      amount: ledgerResult.amount,
      reference: ledgerResult.reference,
      description: ledgerResult.description,
      status: ledgerResult.status as "COMPLETED" | "FAILED" | "REVERSED",
      reviewNote: input.reviewNote ?? null,
    });

    if (input.status === "COMPLETED" || input.status === "FAILED") {
      void sendAdminAlertEmail({
        subject: `Transfer review ${input.status === "COMPLETED" ? "approved and posted" : "declined"}`,
        message: `${existing.user.fullName}'s transfer ${ledgerResult.reference} was marked ${input.status}.`,
        idempotencyKey: `admin-alert/transfer-review/${ledgerResult.reference}/${input.status}`,
      });
    }

    void createTransferNotification({
      userId: existing.user.id,
      event:
        input.status === "COMPLETED"
          ? "approved"
          : input.status === "FAILED"
            ? "failed"
            : "reversed",
      reference: ledgerResult.reference,
      amount: ledgerResult.amount,
      metadata: { href: "/auth/transactions" },
    });

    if (input.status === "FAILED" || input.status === "REVERSED") {
      const reviewAssessment = await scoreAdminReviewRisk({
        userId: existing.user.id,
        action: input.status,
        reference: ledgerResult.reference,
      });

      void applyRiskAssessment({
        userId: existing.user.id,
        assessment: reviewAssessment,
      });
    }

    void writeLedgerEvent({
      eventType:
        input.status === "COMPLETED"
          ? "TRANSFER_POSTED"
          : input.status === "REVERSED"
            ? "TRANSFER_REVERSED"
            : "TRANSFER_FAILED",
      actorId: auth.admin.id,
      entityId: ledgerResult.id,
      message: `Transfer ${ledgerResult.reference} marked ${ledgerResult.status}.`,
      severity: input.status === "COMPLETED" ? "INFO" : "WARNING",
      metadata: { reference: ledgerResult.reference, status: ledgerResult.status },
    });

    return apiSuccess({ transaction: serializeTransaction(updated) });
  } catch (error) {
    return handleApiError(error);
  }
}
