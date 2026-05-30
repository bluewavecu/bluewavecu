import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import { maskAccountNumber } from "@/lib/bankingSerialize";
import { sendAdminAlertEmail } from "@/lib/email";
import { enqueueJob } from "@/lib/jobQueue";
import { createNotification } from "@/lib/notifications";
import { getPrisma } from "@/lib/prisma";
import { applyRiskAssessment, scoreTransferRisk, shouldBlockAction } from "@/lib/risk";
import { computeNextRunAt, maskDestinationAccountNumber } from "@/lib/scheduledTransfers";
import { enforceRateLimit, rateLimitPresets } from "@/lib/rateLimit";
import { scheduledTransferSchema } from "@/lib/validators";
import type { ScheduledTransferRecord, ScheduledTransfersData } from "@/types/banking";

export const runtime = "nodejs";

function serializeScheduledTransfer(record: {
  id: string;
  fromAccountId: string;
  recipientName: string | null;
  destinationAccountNumber: string | null;
  amount: { toNumber: () => number };
  memo: string | null;
  frequency: ScheduledTransferRecord["frequency"];
  scheduledFor: Date;
  nextRunAt: Date;
  status: ScheduledTransferRecord["status"];
  createdAt: Date;
  updatedAt: Date;
  fromAccount: { accountNumber: string };
}): ScheduledTransferRecord {
  const masked = maskAccountNumber(record.fromAccount.accountNumber);

  return {
    id: record.id,
    fromAccountId: record.fromAccountId,
    maskedAccountNumber: masked.masked,
    recipientName: record.recipientName,
    destinationAccountNumber: maskDestinationAccountNumber(record.destinationAccountNumber),
    amount: record.amount.toNumber(),
    memo: record.memo,
    frequency: record.frequency,
    scheduledFor: record.scheduledFor.toISOString(),
    nextRunAt: record.nextRunAt.toISOString(),
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Unauthorized", 401);
    }

    const records = await getPrisma().scheduledTransfer.findMany({
      where: { userId: payload.userId },
      include: {
        fromAccount: {
          select: { accountNumber: true },
        },
      },
      orderBy: { nextRunAt: "asc" },
    });

    const data: ScheduledTransfersData = {
      scheduledTransfers: records.map(serializeScheduledTransfer),
    };

    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Unauthorized", 401);
    }

    const rateLimit = enforceRateLimit(request, "scheduled-transfers", rateLimitPresets.transfer);

    if (!rateLimit.allowed) {
      return apiError(rateLimit.message, 429);
    }

    const input = scheduledTransferSchema.parse(await request.json());
    const prisma = getPrisma();

    const account = await prisma.account.findFirst({
      where: {
        id: input.fromAccountId,
        userId: payload.userId,
      },
      select: {
        id: true,
        accountNumber: true,
      },
    });

    if (!account) {
      return apiError("Account not found", 404);
    }

    if (input.scheduledFor.getTime() <= Date.now()) {
      return apiError("Scheduled date must be in the future", 400);
    }

    const assessment = await scoreTransferRisk({
      userId: payload.userId,
      amount: input.amount,
      destinationAccountNumber: input.destinationAccountNumber,
      isScheduled: true,
    });

    if (shouldBlockAction(assessment.severity)) {
      await applyRiskAssessment({ userId: payload.userId, assessment });
      return apiError("Transfer blocked due to critical risk review.", 403);
    }

    void applyRiskAssessment({ userId: payload.userId, assessment });

    const nextRunAt = computeNextRunAt(input.frequency, input.scheduledFor);

    const scheduledTransfer = await prisma.scheduledTransfer.create({
      data: {
        userId: payload.userId,
        fromAccountId: account.id,
        recipientName: input.recipientName?.trim() || null,
        destinationAccountNumber: input.destinationAccountNumber?.trim() || null,
        amount: input.amount,
        memo: input.memo?.trim() || null,
        frequency: input.frequency,
        scheduledFor: input.scheduledFor,
        nextRunAt,
        status: "ACTIVE",
      },
      include: {
        fromAccount: {
          select: { accountNumber: true },
        },
      },
    });

    // Worker not implemented yet — queue only records future review generation intent.
    void enqueueJob({
      jobType: "SCHEDULED_TRANSFER_REVIEW",
      runAt: nextRunAt,
      payload: {
        scheduledTransferId: scheduledTransfer.id,
        userId: payload.userId,
      },
    });

    void createNotification({
      userId: payload.userId,
      type: "TRANSFER",
      title: "Scheduled transfer created",
      message: `Your ${input.frequency.toLowerCase().replace("_", " ")} transfer for $${input.amount.toFixed(2)} was scheduled.`,
      metadata: { href: "/transfers", scheduledTransferId: scheduledTransfer.id },
    });

    if (input.amount >= 5000 || assessment.severity === "HIGH") {
      void sendAdminAlertEmail({
        subject: "Scheduled transfer review alert",
        message: `Member scheduled a transfer for $${input.amount.toFixed(2)} (${assessment.severity} risk).`,
        idempotencyKey: `admin-alert/scheduled-transfer/${scheduledTransfer.id}`,
      });
    }

    return apiSuccess(
      {
        scheduledTransfer: serializeScheduledTransfer(scheduledTransfer),
        message:
          "Scheduled transfer saved. Future runs create review requests and still require admin approval before posting.",
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
