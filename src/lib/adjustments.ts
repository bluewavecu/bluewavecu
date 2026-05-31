import { randomUUID } from "crypto";
import { Prisma } from "@/generated/prisma/client";
import { logAdminAction } from "@/lib/admin";
import { maskAccountNumber } from "@/lib/bankingSerialize";
import { sendAdjustmentPostedEmail, sendAdminAlertEmail } from "@/lib/email";
import { writeAdminEvent, writeLedgerEvent } from "@/lib/eventLog";
import { enqueueJob } from "@/lib/jobQueue";
import { LedgerError } from "@/lib/ledger";
import { createNotification } from "@/lib/notifications";
import { getPrisma } from "@/lib/prisma";
import type { AccountType, AdjustmentRecord, AdjustmentStatus, LedgerDirection } from "@/types/banking";

function decimal(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}

function hasInsufficientFunds(accountType: AccountType, balance: number, amount: number) {
  if (accountType === "CREDIT") {
    return false;
  }

  return balance < amount;
}

export function serializeAdjustment(record: {
  id: string;
  accountId: string;
  userId: string;
  adminId: string;
  amount: { toNumber: () => number };
  direction: LedgerDirection;
  reason: string;
  status: AdjustmentStatus;
  reviewedAt: Date | null;
  postedAt: Date | null;
  effectiveAt: Date;
  reviewNote: string | null;
  transactionId: string | null;
  createdAt: Date;
  updatedAt: Date;
  account?: { accountNumber: string | null; accountType: string };
  user?: { fullName: string; email: string };
}): AdjustmentRecord {
  return {
    id: record.id,
    accountId: record.accountId,
    userId: record.userId,
    adminId: record.adminId,
    amount: record.amount.toNumber(),
    direction: record.direction,
    reason: record.reason,
    status: record.status,
    reviewedAt: record.reviewedAt?.toISOString() ?? null,
    postedAt: record.postedAt?.toISOString() ?? null,
    effectiveAt: record.effectiveAt.toISOString(),
    reviewNote: record.reviewNote,
    transactionId: record.transactionId,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    accountNumber: record.account?.accountNumber ?? undefined,
    accountType: record.account?.accountType as AdjustmentRecord["accountType"],
    userName: record.user?.fullName,
    userEmail: record.user?.email,
  };
}

const adjustmentInclude = {
  account: { select: { accountNumber: true, accountType: true } },
  user: { select: { fullName: true, email: true } },
} as const;

export async function createAdjustmentRequest(params: {
  adminId: string;
  accountId: string;
  amount: number;
  direction: LedgerDirection;
  reason: string;
  effectiveAt: Date;
}) {
  const prisma = getPrisma();

  const account = await prisma.account.findUnique({
    where: { id: params.accountId },
    include: { user: { select: { id: true, email: true, fullName: true } } },
  });

  if (!account) {
    throw new LedgerError("Account not found", "NOT_FOUND");
  }

  if (params.amount <= 0) {
    throw new LedgerError("Amount must be greater than zero", "INVALID_AMOUNT");
  }

  const adjustment = await prisma.adjustmentRequest.create({
    data: {
      accountId: account.id,
      userId: account.userId,
      adminId: params.adminId,
      amount: decimal(params.amount),
      direction: params.direction,
      reason: params.reason.trim(),
      effectiveAt: params.effectiveAt,
      status: "PENDING",
    },
    include: adjustmentInclude,
  });

  void writeAdminEvent({
    eventType: "ADJUSTMENT_REQUEST_CREATED",
    actorId: params.adminId,
    entityId: adjustment.id,
    message: `Adjustment request created for account ending ${maskAccountNumber(account.accountNumber).last4}.`,
    metadata: {
      direction: params.direction,
      amount: params.amount,
      effectiveAt: params.effectiveAt.toISOString(),
    },
  });

  void sendAdminAlertEmail({
    subject: "Balance adjustment request pending",
    message: `New ${params.direction} adjustment of $${params.amount.toFixed(2)} for ${account.user.fullName}.`,
    idempotencyKey: `admin-alert/adjustment/${adjustment.id}`,
  });

  return serializeAdjustment(adjustment);
}

export async function approveAdjustmentRequest(params: {
  adjustmentId: string;
  adminId: string;
  reviewNote?: string;
}) {
  const adjustment = await getPrisma().adjustmentRequest.findUnique({
    where: { id: params.adjustmentId },
  });

  if (!adjustment) {
    throw new LedgerError("Adjustment request not found", "NOT_FOUND");
  }

  if (adjustment.status !== "PENDING") {
    throw new LedgerError("Only pending adjustments can be approved", "INVALID_STATUS");
  }

  const updated = await getPrisma().adjustmentRequest.update({
    where: { id: params.adjustmentId },
    data: {
      status: "APPROVED",
      reviewedAt: new Date(),
      reviewNote: params.reviewNote?.trim() || null,
    },
    include: adjustmentInclude,
  });

  void writeAdminEvent({
    eventType: "ADJUSTMENT_APPROVED",
    actorId: params.adminId,
    entityId: updated.id,
    message: "Balance adjustment request approved.",
  });

  await logAdminAction({
    adminId: params.adminId,
    action: "APPROVE_ADJUSTMENT",
    entityType: "AdjustmentRequest",
    entityId: updated.id,
    details: { reviewNote: params.reviewNote ?? null },
  });

  return serializeAdjustment(updated);
}

export async function rejectAdjustmentRequest(params: {
  adjustmentId: string;
  adminId: string;
  reviewNote?: string;
}) {
  const adjustment = await getPrisma().adjustmentRequest.findUnique({
    where: { id: params.adjustmentId },
  });

  if (!adjustment) {
    throw new LedgerError("Adjustment request not found", "NOT_FOUND");
  }

  if (
    adjustment.status !== "PENDING" &&
    adjustment.status !== "APPROVED" &&
    adjustment.status !== "SCHEDULED"
  ) {
    throw new LedgerError("Adjustment cannot be rejected in current status", "INVALID_STATUS");
  }

  const updated = await getPrisma().adjustmentRequest.update({
    where: { id: params.adjustmentId },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewNote: params.reviewNote?.trim() || null,
    },
    include: adjustmentInclude,
  });

  void writeAdminEvent({
    eventType: "ADJUSTMENT_REJECTED",
    actorId: params.adminId,
    entityId: updated.id,
    message: "Balance adjustment request rejected.",
    severity: "WARNING",
  });

  await logAdminAction({
    adminId: params.adminId,
    action: "REJECT_ADJUSTMENT",
    entityType: "AdjustmentRequest",
    entityId: updated.id,
    details: { reviewNote: params.reviewNote ?? null },
  });

  void createNotification({
    userId: updated.userId,
    type: "ACCOUNT",
    title: "Adjustment request rejected",
    message: `Your balance adjustment request was rejected.`,
    metadata: { href: "/auth/accounts", adjustmentId: updated.id },
  });

  return serializeAdjustment(updated);
}

async function scheduleAdjustmentPost(params: { adjustmentId: string; adminId: string }) {
  const prisma = getPrisma();
  const adjustment = await prisma.adjustmentRequest.findUnique({
    where: { id: params.adjustmentId },
    include: adjustmentInclude,
  });

  if (!adjustment) {
    throw new LedgerError("Adjustment request not found", "NOT_FOUND");
  }

  if (adjustment.status !== "APPROVED") {
    throw new LedgerError("Only approved adjustments can be scheduled", "INVALID_STATUS");
  }

  if (adjustment.transactionId) {
    throw new LedgerError("Adjustment has already been posted", "ALREADY_POSTED");
  }

  await enqueueJob({
    jobType: "POST_ADJUSTMENT",
    runAt: adjustment.effectiveAt,
    payload: {
      adjustmentId: adjustment.id,
      adminId: params.adminId,
    },
  });

  const updated = await prisma.adjustmentRequest.update({
    where: { id: adjustment.id },
    data: { status: "SCHEDULED" },
    include: adjustmentInclude,
  });

  void writeAdminEvent({
    eventType: "ADJUSTMENT_SCHEDULED",
    actorId: params.adminId,
    entityId: updated.id,
    message: `Adjustment scheduled for ${adjustment.effectiveAt.toISOString()}.`,
    metadata: {
      effectiveAt: adjustment.effectiveAt.toISOString(),
    },
  });

  return serializeAdjustment(updated);
}

export async function postAdjustmentRequest(params: {
  adjustmentId: string;
  adminId: string;
  fromSchedule?: boolean;
}) {
  const prisma = getPrisma();

  const adjustment = await prisma.adjustmentRequest.findUnique({
    where: { id: params.adjustmentId },
    include: {
      account: true,
      user: { select: { id: true, email: true, fullName: true } },
    },
  });

  if (!adjustment) {
    throw new LedgerError("Adjustment request not found", "NOT_FOUND");
  }

  const allowedStatus = params.fromSchedule ? "SCHEDULED" : "APPROVED";

  if (adjustment.status !== allowedStatus) {
    throw new LedgerError(
      params.fromSchedule
        ? "Only scheduled adjustments can be posted by the worker"
        : "Only approved adjustments can be posted",
      "INVALID_STATUS",
    );
  }

  if (adjustment.transactionId) {
    throw new LedgerError("Adjustment has already been posted", "ALREADY_POSTED");
  }

  const effectiveAt = adjustment.effectiveAt;
  const now = new Date();

  if (!params.fromSchedule && effectiveAt > now) {
    return scheduleAdjustmentPost(params);
  }

  return prisma.$transaction(async (tx) => {
    const lockedAdjustment = await tx.adjustmentRequest.findUnique({
      where: { id: params.adjustmentId },
      include: {
        account: true,
        user: { select: { id: true, email: true, fullName: true } },
      },
    });

    if (!lockedAdjustment) {
      throw new LedgerError("Adjustment request not found", "NOT_FOUND");
    }

    const amount = lockedAdjustment.amount.toNumber();
    const account = lockedAdjustment.account;
    const balance = account.balance.toNumber();
    const available = account.availableBalance.toNumber();

    if (lockedAdjustment.direction === "DEBIT") {
      if (
        hasInsufficientFunds(account.accountType, balance, amount) ||
        hasInsufficientFunds(account.accountType, available, amount)
      ) {
        throw new LedgerError("Insufficient funds for debit adjustment", "INSUFFICIENT_FUNDS");
      }
    }

    const balanceAfter =
      lockedAdjustment.direction === "CREDIT" ? balance + amount : balance - amount;
    const availableAfter =
      lockedAdjustment.direction === "CREDIT" ? available + amount : available - amount;

    const reference = `ADJ-${randomUUID()}`;
    const txType = lockedAdjustment.direction === "CREDIT" ? "DEPOSIT" : "WITHDRAWAL";
    const signedAmount = lockedAdjustment.direction === "CREDIT" ? amount : -amount;

    const transaction = await tx.transaction.create({
      data: {
        userId: lockedAdjustment.userId,
        accountId: lockedAdjustment.accountId,
        type: txType,
        amount: decimal(signedAmount),
        description: lockedAdjustment.reason,
        merchant: null,
        reference,
        status: "COMPLETED",
        createdAt: effectiveAt,
        postedAt: effectiveAt,
        reviewedAt: now,
        reviewedBy: params.adminId,
        reviewNote: lockedAdjustment.reviewNote,
      },
    });

    await tx.account.update({
      where: { id: account.id },
      data: {
        balance: decimal(balanceAfter),
        availableBalance: decimal(availableAfter),
      },
    });

    await tx.ledgerEntry.create({
      data: {
        transactionId: transaction.id,
        accountId: account.id,
        userId: lockedAdjustment.userId,
        direction: lockedAdjustment.direction,
        amount: decimal(amount),
        currency: account.currency,
        balanceBefore: decimal(balance),
        balanceAfter: decimal(balanceAfter),
        description: `${lockedAdjustment.direction === "CREDIT" ? "Credit" : "Debit"}: ${lockedAdjustment.reason}`,
        createdAt: effectiveAt,
      },
    });

    const postedAt = now;

    const updated = await tx.adjustmentRequest.update({
      where: { id: lockedAdjustment.id },
      data: {
        status: "POSTED",
        postedAt,
        transactionId: transaction.id,
      },
      include: adjustmentInclude,
    });

    void writeLedgerEvent({
      eventType: "ADJUSTMENT_POSTED",
      actorId: params.adminId,
      entityId: updated.id,
      message: `Controlled adjustment posted for ${reference}.`,
      metadata: {
        reference,
        direction: lockedAdjustment.direction,
        amount,
        effectiveAt: effectiveAt.toISOString(),
      },
    });

    void sendAdjustmentPostedEmail({
      email: lockedAdjustment.user.email,
      fullName: lockedAdjustment.user.fullName,
      amount,
      direction: lockedAdjustment.direction,
      reference,
    });

    void createNotification({
      userId: lockedAdjustment.userId,
      type: "ACCOUNT",
      title: "Balance adjustment posted",
      message: `A ${lockedAdjustment.direction.toLowerCase()} adjustment of $${amount.toFixed(2)} was posted to your account.`,
      metadata: { href: "/auth/transactions", reference },
    });

    return serializeAdjustment(updated);
  });
}

export { LedgerError };
