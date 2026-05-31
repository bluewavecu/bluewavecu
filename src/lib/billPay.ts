import { randomUUID } from "crypto";
import { maskAccountNumber } from "@/lib/bankingSerialize";
import {
  sendAdminAlertEmail,
  sendBillPaymentCreatedEmail,
  sendBillPaymentReviewedEmail,
  sendPayeeAddedEmail,
} from "@/lib/email";
import { writeAdminEvent, writeEventLog, writeLedgerEvent } from "@/lib/eventLog";
import { enqueueJob } from "@/lib/jobQueue";
import {
  failReviewedPaymentTransaction,
  LedgerError,
  postApprovedPaymentTransaction,
} from "@/lib/ledger";
import {
  createBillPaymentNotification,
  createPayeeNotification,
} from "@/lib/notifications";
import { getPrisma } from "@/lib/prisma";
import { applyRiskAssessment, scoreBillPaymentRisk, shouldBlockAction } from "@/lib/risk";
import type {
  BillPaymentRecord,
  BillPaymentStatus,
  PayeeRecord,
  PayeeStatus,
} from "@/types/banking";
import type {
  BillPaymentCreateInput,
  PayeeCreateInput,
  PayeeUpdateInput,
} from "@/lib/validators";

function maskPayeeAccountNumber(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (trimmed.length <= 4) {
    return `****${trimmed}`;
  }

  return `****${trimmed.slice(-4)}`;
}

export function serializePayee(payee: {
  id: string;
  name: string;
  nickname: string | null;
  category: string | null;
  accountNumber: string | null;
  routingNumber: string | null;
  address: string | null;
  phone: string | null;
  status: PayeeStatus;
  createdAt: Date;
  updatedAt: Date;
}): PayeeRecord {
  return {
    id: payee.id,
    name: payee.name,
    nickname: payee.nickname,
    category: payee.category,
    maskedAccountNumber: maskPayeeAccountNumber(payee.accountNumber),
    routingNumber: payee.routingNumber,
    address: payee.address,
    phone: payee.phone,
    status: payee.status,
    createdAt: payee.createdAt.toISOString(),
    updatedAt: payee.updatedAt.toISOString(),
  };
}

export function serializeBillPayment(record: {
  id: string;
  fromAccountId: string;
  payeeId: string;
  amount: { toNumber: () => number };
  memo: string | null;
  dueDate: Date | null;
  scheduledFor: Date | null;
  status: BillPaymentStatus;
  transactionId: string | null;
  riskScore: number | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  reviewNote: string | null;
  createdAt: Date;
  updatedAt: Date;
  fromAccount: { accountNumber: string };
  payee: { id: string; name: string; nickname: string | null; category: string | null };
}): BillPaymentRecord {
  const masked = maskAccountNumber(record.fromAccount.accountNumber);

  return {
    id: record.id,
    fromAccountId: record.fromAccountId,
    maskedAccountNumber: masked.masked,
    payeeId: record.payeeId,
    payeeName: record.payee.nickname ?? record.payee.name,
    payeeCategory: record.payee.category,
    amount: record.amount.toNumber(),
    memo: record.memo,
    dueDate: record.dueDate?.toISOString() ?? null,
    scheduledFor: record.scheduledFor?.toISOString() ?? null,
    status: record.status,
    transactionId: record.transactionId,
    riskScore: record.riskScore,
    reviewedAt: record.reviewedAt?.toISOString() ?? null,
    reviewedBy: record.reviewedBy,
    reviewNote: record.reviewNote,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

const billPaymentInclude = {
  fromAccount: { select: { accountNumber: true } },
  payee: { select: { id: true, name: true, nickname: true, category: true } },
} as const;

export async function createPayee(userId: string, input: PayeeCreateInput) {
  const payee = await getPrisma().payee.create({
    data: {
      userId,
      name: input.name.trim(),
      nickname: input.nickname?.trim() || null,
      category: input.category?.trim() || null,
      accountNumber: input.accountNumber?.trim() || null,
      routingNumber: input.routingNumber?.trim() || null,
      address: input.address?.trim() || null,
      phone: input.phone?.trim() || null,
      status: "ACTIVE",
    },
  });

  const user = await getPrisma().user.findUnique({
    where: { id: userId },
    select: { email: true, fullName: true },
  });

  if (user) {
    void sendPayeeAddedEmail({
      email: user.email,
      fullName: user.fullName,
      payeeName: payee.name,
    });
  }

  void createPayeeNotification({
    userId,
    payeeName: payee.name,
    payeeId: payee.id,
  });

  return serializePayee(payee);
}

export async function updatePayee(userId: string, payeeId: string, input: PayeeUpdateInput) {
  const existing = await getPrisma().payee.findFirst({
    where: { id: payeeId, userId, status: { not: "DELETED" } },
  });

  if (!existing) {
    throw new Error("Payee not found");
  }

  const payee = await getPrisma().payee.update({
    where: { id: payeeId },
    data: {
      name: input.name?.trim() ?? existing.name,
      nickname: input.nickname !== undefined ? input.nickname?.trim() || null : existing.nickname,
      category: input.category !== undefined ? input.category?.trim() || null : existing.category,
      accountNumber:
        input.accountNumber !== undefined ? input.accountNumber?.trim() || null : existing.accountNumber,
      routingNumber:
        input.routingNumber !== undefined ? input.routingNumber?.trim() || null : existing.routingNumber,
      address: input.address !== undefined ? input.address?.trim() || null : existing.address,
      phone: input.phone !== undefined ? input.phone?.trim() || null : existing.phone,
      status: input.status ?? existing.status,
    },
  });

  return serializePayee(payee);
}

export async function softDeletePayee(userId: string, payeeId: string) {
  const result = await getPrisma().payee.updateMany({
    where: { id: payeeId, userId, status: { not: "DELETED" } },
    data: { status: "DELETED" },
  });

  return result.count > 0;
}

export async function createBillPayment(userId: string, input: BillPaymentCreateInput) {
  const prisma = getPrisma();

  const [account, payee] = await Promise.all([
    prisma.account.findFirst({
      where: { id: input.fromAccountId, userId },
    }),
    prisma.payee.findFirst({
      where: { id: input.payeeId, userId, status: "ACTIVE" },
    }),
  ]);

  if (!account) {
    throw new Error("Account not found");
  }

  if (!payee) {
    throw new Error("Payee not found");
  }

  const assessment = await scoreBillPaymentRisk({
    userId,
    amount: input.amount,
    payeeId: input.payeeId,
  });

  if (shouldBlockAction(assessment.severity)) {
    await applyRiskAssessment({ userId, assessment });
    throw new Error("Bill payment blocked due to critical risk review.");
  }

  void applyRiskAssessment({ userId, assessment });

  const status: BillPaymentStatus = input.scheduledFor ? "SCHEDULED" : "DRAFT";

  const billPayment = await prisma.billPayment.create({
    data: {
      userId,
      fromAccountId: account.id,
      payeeId: payee.id,
      amount: input.amount,
      memo: input.memo?.trim() || null,
      dueDate: input.dueDate ?? null,
      scheduledFor: input.scheduledFor ?? null,
      status,
      riskScore: assessment.score,
    },
    include: billPaymentInclude,
  });

  if (input.scheduledFor) {
    // Worker not implemented yet — queue only records future review generation intent.
    void enqueueJob({
      jobType: "BILL_PAYMENT_REVIEW",
      runAt: input.scheduledFor,
      payload: {
        billPaymentId: billPayment.id,
        userId,
      },
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, fullName: true },
  });

  if (user) {
    void sendBillPaymentCreatedEmail({
      email: user.email,
      fullName: user.fullName,
      amount: input.amount,
      payeeName: payee.nickname ?? payee.name,
      status,
    });
  }

  void createBillPaymentNotification({
    userId,
    event: "created",
    payeeName: payee.nickname ?? payee.name,
    amount: input.amount,
    billPaymentId: billPayment.id,
  });

  void writeEventLog({
    eventType: "BILL_PAYMENT_CREATED",
    actorId: userId,
    entityType: "BillPayment",
    entityId: billPayment.id,
    message: `Bill payment created for ${payee.nickname ?? payee.name}.`,
    metadata: { amount: input.amount, status },
  });

  if (input.amount >= 5000 || assessment.severity === "HIGH") {
    void sendAdminAlertEmail({
      subject: "Bill payment review alert",
      message: `Member scheduled a bill payment for $${input.amount.toFixed(2)} to ${payee.name}.`,
      idempotencyKey: `admin-alert/bill-payment/${billPayment.id}`,
    });
  }

  return serializeBillPayment(billPayment);
}

export async function cancelBillPayment(userId: string, billPaymentId: string) {
  const existing = await getPrisma().billPayment.findFirst({
    where: {
      id: billPaymentId,
      userId,
      status: { in: ["DRAFT", "SCHEDULED", "PENDING_REVIEW"] },
    },
  });

  if (!existing) {
    throw new Error("Bill payment not found or cannot be cancelled");
  }

  const updated = await getPrisma().billPayment.update({
    where: { id: billPaymentId },
    data: { status: "CANCELLED" },
    include: billPaymentInclude,
  });

  void createBillPaymentNotification({
    userId,
    event: "cancelled",
    payeeName: updated.payee.nickname ?? updated.payee.name,
    amount: updated.amount.toNumber(),
    billPaymentId: updated.id,
  });

  return serializeBillPayment(updated);
}

export async function submitBillPaymentForReview(userId: string, billPaymentId: string) {
  const prisma = getPrisma();

  const billPayment = await prisma.billPayment.findFirst({
    where: {
      id: billPaymentId,
      userId,
      status: { in: ["DRAFT", "SCHEDULED"] },
    },
    include: {
      ...billPaymentInclude,
      payee: true,
    },
  });

  if (!billPayment) {
    throw new Error("Bill payment not found or already submitted");
  }

  const reference = `BILL-${randomUUID()}`;
  const payeeLabel = billPayment.payee.nickname ?? billPayment.payee.name;
  const description = billPayment.memo
    ? `Bill payment to ${payeeLabel}: ${billPayment.memo}`
    : `Bill payment to ${payeeLabel}`;

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      accountId: billPayment.fromAccountId,
      type: "PAYMENT",
      amount: -Math.abs(billPayment.amount.toNumber()),
      description,
      merchant: payeeLabel,
      reference,
      status: "PENDING",
    },
  });

  const updated = await prisma.billPayment.update({
    where: { id: billPaymentId },
    data: {
      status: "PENDING_REVIEW",
      transactionId: transaction.id,
    },
    include: billPaymentInclude,
  });

  void sendAdminAlertEmail({
    subject: "Bill payment pending review",
    message: `${payeeLabel} bill payment for $${billPayment.amount.toNumber().toFixed(2)} requires operations review.`,
    idempotencyKey: `admin-alert/bill-payment-review/${billPayment.id}`,
  });

  void createBillPaymentNotification({
    userId,
    event: "submitted",
    payeeName: payeeLabel,
    amount: billPayment.amount.toNumber(),
    billPaymentId: billPayment.id,
  });

  return serializeBillPayment(updated);
}

export async function approveBillPaymentReview(params: {
  billPaymentId: string;
  adminId: string;
  reviewNote?: string;
}) {
  const prisma = getPrisma();

  const billPayment = await prisma.billPayment.findUnique({
    where: { id: params.billPaymentId },
    include: {
      ...billPaymentInclude,
      transaction: true,
      user: { select: { id: true, email: true, fullName: true } },
    },
  });

  if (!billPayment) {
    throw new LedgerError("Bill payment not found", "NOT_FOUND");
  }

  if (billPayment.status !== "PENDING_REVIEW") {
    throw new LedgerError("Only pending review bill payments can be approved", "INVALID_STATUS");
  }

  if (!billPayment.transactionId || !billPayment.transaction) {
    throw new LedgerError("Linked payment transaction is missing", "NOT_FOUND");
  }

  const ledgerResult = await postApprovedPaymentTransaction({
    transactionId: billPayment.transactionId,
    adminId: params.adminId,
    reviewNote: params.reviewNote,
  });

  const updated = await prisma.billPayment.update({
    where: { id: params.billPaymentId },
    data: {
      status: "POSTED",
      reviewedAt: new Date(),
      reviewedBy: params.adminId,
      reviewNote: params.reviewNote?.trim() || null,
    },
    include: billPaymentInclude,
  });

  void sendBillPaymentReviewedEmail({
    email: billPayment.user.email,
    fullName: billPayment.user.fullName,
    amount: billPayment.amount.toNumber(),
    payeeName: billPayment.payee.nickname ?? billPayment.payee.name,
    status: "POSTED",
    reference: ledgerResult.reference ?? billPayment.transaction.reference,
  });

  void createBillPaymentNotification({
    userId: billPayment.userId,
    event: "approved",
    payeeName: billPayment.payee.nickname ?? billPayment.payee.name,
    amount: billPayment.amount.toNumber(),
    billPaymentId: billPayment.id,
  });

  void writeLedgerEvent({
    eventType: "BILL_PAYMENT_POSTED",
    actorId: params.adminId,
    entityId: updated.id,
    message: `Bill payment posted (${ledgerResult.reference ?? billPayment.transaction.reference}).`,
    metadata: { status: "POSTED" },
  });

  return { billPayment: serializeBillPayment(updated), transaction: ledgerResult };
}

export async function failBillPaymentReview(params: {
  billPaymentId: string;
  adminId: string;
  action: "FAILED" | "CANCELLED";
  reviewNote?: string;
}) {
  const prisma = getPrisma();

  const billPayment = await prisma.billPayment.findUnique({
    where: { id: params.billPaymentId },
    include: {
      ...billPaymentInclude,
      transaction: true,
      user: { select: { id: true, email: true, fullName: true } },
    },
  });

  if (!billPayment) {
    throw new LedgerError("Bill payment not found", "NOT_FOUND");
  }

  if (billPayment.status !== "PENDING_REVIEW") {
    throw new LedgerError("Only pending review bill payments can be reviewed", "INVALID_STATUS");
  }

  if (billPayment.transactionId && billPayment.transaction) {
    await failReviewedPaymentTransaction({
      transactionId: billPayment.transactionId,
      adminId: params.adminId,
      status: "FAILED",
      reviewNote: params.reviewNote,
    });
  }

  const nextStatus: BillPaymentStatus = params.action === "CANCELLED" ? "CANCELLED" : "FAILED";

  const updated = await prisma.billPayment.update({
    where: { id: params.billPaymentId },
    data: {
      status: nextStatus,
      reviewedAt: new Date(),
      reviewedBy: params.adminId,
      reviewNote: params.reviewNote?.trim() || null,
    },
    include: billPaymentInclude,
  });

  void sendBillPaymentReviewedEmail({
    email: billPayment.user.email,
    fullName: billPayment.user.fullName,
    amount: billPayment.amount.toNumber(),
    payeeName: billPayment.payee.nickname ?? billPayment.payee.name,
    status: nextStatus,
    reference: billPayment.transaction?.reference,
  });

  void createBillPaymentNotification({
    userId: billPayment.userId,
    event: nextStatus === "CANCELLED" ? "cancelled" : "failed",
    payeeName: billPayment.payee.nickname ?? billPayment.payee.name,
    amount: billPayment.amount.toNumber(),
    billPaymentId: billPayment.id,
  });

  void writeAdminEvent({
    eventType: "BILL_PAYMENT_REVIEWED",
    actorId: params.adminId,
    entityId: updated.id,
    message: `Bill payment marked ${nextStatus}.`,
    severity: nextStatus === "FAILED" ? "WARNING" : "INFO",
    metadata: { status: nextStatus },
  });

  return serializeBillPayment(updated);
}

export { LedgerError };
