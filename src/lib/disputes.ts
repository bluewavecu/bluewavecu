import { sendAdminAlertEmail, sendDisputeCreatedEmail, sendDisputeUpdatedEmail } from "@/lib/email";
import { writeAdminEvent, writeEventLog } from "@/lib/eventLog";
import { createNotification } from "@/lib/notifications";
import { getPrisma } from "@/lib/prisma";
import type { DisputeRecord, DisputeStatus } from "@/types/banking";

export function serializeDispute(record: {
  id: string;
  userId: string;
  transactionId: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  resolutionNote: string | null;
  createdAt: Date;
  updatedAt: Date;
  transaction?: {
    reference: string;
    amount: { toNumber: () => number };
    description: string;
    merchant: string | null;
    status: string;
  };
  user?: { fullName: string; email: string };
}): DisputeRecord {
  return {
    id: record.id,
    userId: record.userId,
    transactionId: record.transactionId,
    reason: record.reason,
    description: record.description,
    status: record.status,
    resolutionNote: record.resolutionNote,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    transaction: record.transaction
      ? {
          reference: record.transaction.reference,
          amount: record.transaction.amount.toNumber(),
          description: record.transaction.description,
          merchant: record.transaction.merchant,
          status: record.transaction.status,
        }
      : undefined,
    userName: record.user?.fullName,
    userEmail: record.user?.email,
  };
}

const disputeInclude = {
  transaction: {
    select: {
      reference: true,
      amount: true,
      description: true,
      merchant: true,
      status: true,
    },
  },
  user: { select: { fullName: true, email: true } },
} as const;

export async function createDispute(params: {
  userId: string;
  transactionId: string;
  reason: string;
  description: string;
}) {
  const prisma = getPrisma();

  const transaction = await prisma.transaction.findFirst({
    where: {
      id: params.transactionId,
      userId: params.userId,
    },
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  const existingOpen = await prisma.dispute.findFirst({
    where: {
      transactionId: params.transactionId,
      userId: params.userId,
      status: { in: ["OPEN", "UNDER_REVIEW"] },
    },
  });

  if (existingOpen) {
    throw new Error("An open dispute already exists for this transaction");
  }

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { fullName: true, email: true },
  });

  const dispute = await prisma.dispute.create({
    data: {
      userId: params.userId,
      transactionId: params.transactionId,
      reason: params.reason.trim(),
      description: params.description.trim(),
      status: "OPEN",
    },
    include: disputeInclude,
  });

  void writeEventLog({
    eventType: "DISPUTE_CREATED",
    actorId: params.userId,
    entityType: "Dispute",
    entityId: dispute.id,
    message: `Dispute opened for transaction ${transaction.reference}.`,
    metadata: { transactionId: params.transactionId },
  });

  if (user) {
    void sendDisputeCreatedEmail({
      email: user.email,
      fullName: user.fullName,
      reference: transaction.reference,
      reason: params.reason,
    });
  }

  void sendAdminAlertEmail({
    subject: "New transaction dispute",
    message: `${user?.fullName ?? "Member"} disputed ${transaction.reference}.`,
    idempotencyKey: `admin-alert/dispute/${dispute.id}`,
  });

  void createNotification({
    userId: params.userId,
    type: "SUPPORT",
    title: "Dispute submitted",
    message: `Your dispute for ${transaction.reference} was received.`,
    metadata: { href: "/disputes", disputeId: dispute.id },
  });

  return serializeDispute(dispute);
}

export async function updateDisputeStatus(params: {
  disputeId: string;
  status: DisputeStatus;
  resolutionNote?: string;
  actorId: string;
  isAdmin: boolean;
}) {
  const prisma = getPrisma();

  const dispute = await prisma.dispute.findUnique({
    where: { id: params.disputeId },
    include: disputeInclude,
  });

  if (!dispute) {
    throw new Error("Dispute not found");
  }

  if (!params.isAdmin) {
    if (dispute.userId !== params.actorId) {
      throw new Error("Forbidden");
    }

    if (params.status !== "CLOSED" || dispute.status !== "OPEN") {
      throw new Error("Members may only close their own open disputes");
    }
  }

  const updated = await prisma.dispute.update({
    where: { id: params.disputeId },
    data: {
      status: params.status,
      resolutionNote: params.resolutionNote?.trim() || dispute.resolutionNote,
    },
    include: disputeInclude,
  });

  void writeAdminEvent({
    eventType: "DISPUTE_STATUS_UPDATED",
    actorId: params.actorId,
    entityId: updated.id,
    message: `Dispute status updated to ${params.status}.`,
    metadata: { status: params.status },
  });

  if (updated.user.email) {
    void sendDisputeUpdatedEmail({
      email: updated.user.email,
      fullName: updated.user.fullName,
      reference: updated.transaction.reference,
      status: params.status,
      resolutionNote: params.resolutionNote,
    });
  }

  void createNotification({
    userId: updated.userId,
    type: "SUPPORT",
    title: "Dispute updated",
    message: `Your dispute for ${updated.transaction.reference} is now ${params.status.replaceAll("_", " ").toLowerCase()}.`,
    metadata: { href: "/disputes", disputeId: updated.id },
  });

  return serializeDispute(updated);
}

export async function closeDisputeByUser(userId: string, disputeId: string) {
  return updateDisputeStatus({
    disputeId,
    status: "CLOSED",
    actorId: userId,
    isAdmin: false,
  });
}
