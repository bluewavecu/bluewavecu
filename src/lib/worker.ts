import { randomUUID } from "crypto";
import { submitBillPaymentForReview } from "@/lib/billPay";
import { postAdjustmentRequest } from "@/lib/adjustments";
import { sendAdminAlertEmail, sendTransferCreatedEmail } from "@/lib/email";
import {
  getDueJobs,
  markJobCompleted,
  markJobFailed,
  markJobRunning,
  enqueueJob,
  type JobPayload,
} from "@/lib/jobQueue";
import { createTransferNotification } from "@/lib/notifications";
import { getPrisma } from "@/lib/prisma";
import { writeEventLog } from "@/lib/eventLog";
import { applyRiskAssessment, scoreTransferRisk } from "@/lib/risk";
import { computeNextRunAt } from "@/lib/scheduledTransfers";

export type WorkerRunSummary = {
  processed: number;
  completed: number;
  failed: number;
  results: Array<{
    jobId: string;
    jobType: string;
    status: "COMPLETED" | "FAILED";
    error?: string;
  }>;
};

function buildScheduledTransferDescription(record: {
  recipientName: string | null;
  destinationAccountNumber: string | null;
  memo: string | null;
}) {
  const recipientLabel = record.recipientName
    ? record.recipientName
    : record.destinationAccountNumber
      ? `Account ending ${record.destinationAccountNumber.slice(-4)}`
      : "External recipient";

  if (record.memo) {
    return `Scheduled transfer to ${recipientLabel}: ${record.memo}`;
  }

  return `Scheduled transfer to ${recipientLabel}`;
}

function getPayloadString(payload: JobPayload, key: string) {
  const value = payload[key];

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing or invalid payload field: ${key}`);
  }

  return value;
}

export async function processScheduledTransferReviewJob(payload: JobPayload) {
  const scheduledTransferId = getPayloadString(payload, "scheduledTransferId");
  const prisma = getPrisma();

  const scheduledTransfer = await prisma.scheduledTransfer.findUnique({
    where: { id: scheduledTransferId },
    include: {
      fromAccount: { select: { id: true, accountNumber: true } },
      user: { select: { id: true, email: true, fullName: true } },
    },
  });

  if (!scheduledTransfer) {
    throw new Error("Scheduled transfer not found");
  }

  if (scheduledTransfer.status !== "ACTIVE") {
    return { skipped: true, reason: `Scheduled transfer is ${scheduledTransfer.status}` };
  }

  const amount = scheduledTransfer.amount.toNumber();
  const description = buildScheduledTransferDescription(scheduledTransfer);
  const merchant = scheduledTransfer.recipientName ?? "Scheduled transfer";

  const assessment = await scoreTransferRisk({
    userId: scheduledTransfer.userId,
    amount,
    destinationAccountNumber: scheduledTransfer.destinationAccountNumber,
    isScheduled: true,
  });

  void applyRiskAssessment({ userId: scheduledTransfer.userId, assessment });

  const transaction = await prisma.transaction.create({
    data: {
      userId: scheduledTransfer.userId,
      accountId: scheduledTransfer.fromAccountId,
      type: "TRANSFER",
      amount: -Math.abs(amount),
      description,
      merchant,
      reference: `SCH-${randomUUID()}`,
      status: "PENDING",
      destinationAccountNumber: scheduledTransfer.destinationAccountNumber?.trim() || null,
    },
  });

  void sendTransferCreatedEmail({
    email: scheduledTransfer.user.email,
    fullName: scheduledTransfer.user.fullName,
    amount: transaction.amount.toNumber(),
    reference: transaction.reference,
    description: transaction.description,
  });

  void sendAdminAlertEmail({
    subject: "Scheduled transfer pending review",
    message: `${scheduledTransfer.user.fullName} scheduled transfer ${transaction.reference} for $${amount.toFixed(2)} is ready for operations review.`,
    idempotencyKey: `admin-alert/scheduled-transfer-review/${transaction.reference}`,
  });

  void createTransferNotification({
    userId: scheduledTransfer.userId,
    event: "created",
    reference: transaction.reference,
    amount: transaction.amount.toNumber(),
    metadata: { href: "/auth/transfers", scheduledTransferId: scheduledTransfer.id },
  });

  if (scheduledTransfer.frequency === "ONE_TIME") {
    await prisma.scheduledTransfer.update({
      where: { id: scheduledTransfer.id },
      data: { status: "COMPLETED" },
    });
  } else {
    const nextRunAt = computeNextRunAt(scheduledTransfer.frequency, scheduledTransfer.nextRunAt);

    await prisma.scheduledTransfer.update({
      where: { id: scheduledTransfer.id },
      data: { nextRunAt },
    });

    void enqueueJob({
      jobType: "SCHEDULED_TRANSFER_REVIEW",
      runAt: nextRunAt,
      payload: {
        scheduledTransferId: scheduledTransfer.id,
        userId: scheduledTransfer.userId,
      },
    });
  }

  return {
    skipped: false,
    transactionId: transaction.id,
    reference: transaction.reference,
  };
}

export async function processBillPaymentReviewJob(payload: JobPayload) {
  const billPaymentId = getPayloadString(payload, "billPaymentId");
  const userId = getPayloadString(payload, "userId");

  const billPayment = await getPrisma().billPayment.findFirst({
    where: { id: billPaymentId, userId },
  });

  if (!billPayment) {
    throw new Error("Bill payment not found");
  }

  if (billPayment.status !== "SCHEDULED") {
    return { skipped: true, reason: `Bill payment is ${billPayment.status}` };
  }

  const result = await submitBillPaymentForReview(userId, billPaymentId);

  return {
    skipped: false,
    billPaymentId: result.id,
    status: result.status,
  };
}

async function processPostAdjustmentJob(payload: JobPayload) {
  const adjustmentId = getPayloadString(payload, "adjustmentId");
  const adminId = getPayloadString(payload, "adminId");

  await postAdjustmentRequest({
    adjustmentId,
    adminId,
    fromSchedule: true,
  });

  return {
    skipped: false,
    adjustmentId,
  };
}

async function processJob(job: { id: string; jobType: string; payload: unknown; attempts: number; maxAttempts: number }) {
  const payload = job.payload as JobPayload;

  if (job.jobType === "SCHEDULED_TRANSFER_REVIEW") {
    return processScheduledTransferReviewJob(payload);
  }

  if (job.jobType === "BILL_PAYMENT_REVIEW") {
    return processBillPaymentReviewJob(payload);
  }

  if (job.jobType === "POST_ADJUSTMENT") {
    return processPostAdjustmentJob(payload);
  }

  throw new Error(`Unsupported job type: ${job.jobType}`);
}

export async function runDueJobs(limit = 25): Promise<WorkerRunSummary> {
  const dueJobs = await getDueJobs(limit);
  const summary: WorkerRunSummary = {
    processed: 0,
    completed: 0,
    failed: 0,
    results: [],
  };

  for (const job of dueJobs) {
    summary.processed += 1;

    const locked = await markJobRunning(job.id);

    if (locked.count === 0) {
      continue;
    }

    try {
      await processJob(job);
      await markJobCompleted(job.id);
      summary.completed += 1;
      summary.results.push({
        jobId: job.id,
        jobType: job.jobType,
        status: "COMPLETED",
      });
      void writeEventLog({
        eventType: "JOB_COMPLETED",
        entityType: "JobQueue",
        entityId: job.id,
        message: `Job ${job.jobType} completed.`,
        metadata: { jobType: job.jobType },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown worker error";
      await markJobFailed(job.id, message);
      summary.failed += 1;
      summary.results.push({
        jobId: job.id,
        jobType: job.jobType,
        status: "FAILED",
        error: message,
      });
      void writeEventLog({
        eventType: "JOB_FAILED",
        entityType: "JobQueue",
        entityId: job.id,
        message: `Job ${job.jobType} failed.`,
        severity: "ERROR",
        metadata: { jobType: job.jobType, error: message },
      });
    }
  }

  return summary;
}
