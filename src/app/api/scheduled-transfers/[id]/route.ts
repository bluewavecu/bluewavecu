import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveMemberWriteAuth } from "@/lib/requestAuth";

import { maskAccountNumber } from "@/lib/bankingSerialize";
import { createNotification } from "@/lib/notifications";
import { getPrisma } from "@/lib/prisma";
import { maskDestinationAccountNumber } from "@/lib/scheduledTransfers";
import { scheduledTransferUpdateSchema } from "@/lib/validators";
import type { ScheduledTransferRecord } from "@/types/banking";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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
  fromAccount: { accountNumber: string | null };
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

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const auth = await resolveMemberWriteAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const { id } = await context.params;
    const input = scheduledTransferUpdateSchema.parse(await request.json());
    const prisma = getPrisma();

    const existing = await prisma.scheduledTransfer.findFirst({
      where: {
        id,
        userId: payload.userId,
      },
    });

    if (!existing) {
      return apiError("Scheduled transfer not found", 404);
    }

    if (existing.status === "COMPLETED" || existing.status === "CANCELLED") {
      return apiError("This scheduled transfer can no longer be updated", 400);
    }

    const updated = await prisma.scheduledTransfer.update({
      where: { id },
      data: {
        status: input.status,
      },
      include: {
        fromAccount: {
          select: { accountNumber: true },
        },
      },
    });

    const statusLabel =
      input.status === "ACTIVE"
        ? "resumed"
        : input.status === "PAUSED"
          ? "paused"
          : "cancelled";

    void createNotification({
      userId: payload.userId,
      type: "TRANSFER",
      title: "Scheduled transfer updated",
      message: `Your scheduled transfer was ${statusLabel}.`,
      metadata: { href: "/auth/transfers", scheduledTransferId: updated.id, status: input.status },
    });

    return apiSuccess({
      scheduledTransfer: serializeScheduledTransfer(updated),
      message: `Scheduled transfer ${statusLabel}.`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
