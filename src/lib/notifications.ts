import type { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";

export type NotificationTypeValue =
  | "SYSTEM"
  | "TRANSFER"
  | "ACCOUNT"
  | "SECURITY"
  | "SUPPORT"
  | "ADMIN";

type SafeMetadata = Record<string, string | number | boolean | null>;

function sanitizeMetadata(metadata?: Record<string, unknown>): Prisma.InputJsonValue | undefined {
  if (!metadata) {
    return undefined;
  }

  const safe: SafeMetadata = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      safe[key] = value;
    }
  }

  return Object.keys(safe).length > 0 ? safe : undefined;
}

export async function createNotification(params: {
  userId: string;
  type: NotificationTypeValue;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  return getPrisma().notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      metadata: sanitizeMetadata(params.metadata),
    },
  });
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const result = await getPrisma().notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      isRead: true,
    },
  });

  return result.count > 0;
}

export async function markAllNotificationsRead(userId: string) {
  const result = await getPrisma().notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return result.count;
}

export async function createSecurityNotification(params: {
  userId: string;
  title?: string;
  message?: string;
  metadata?: Record<string, unknown>;
}) {
  return createNotification({
    userId: params.userId,
    type: "SECURITY",
    title: params.title ?? "New sign-in detected",
    message: params.message ?? "A new sign-in to your Bluewave account was detected.",
    metadata: params.metadata,
  });
}

export async function createTransferNotification(params: {
  userId: string;
  event: "created" | "approved" | "failed" | "reversed";
  reference: string;
  amount: number;
  metadata?: Record<string, unknown>;
}) {
  const amountLabel = `$${Math.abs(params.amount).toFixed(2)}`;
  const titles = {
    created: "Transfer submitted for review",
    approved: "Transfer approved and posted",
    failed: "Transfer declined",
    reversed: "Transfer reversed",
  } as const;

  const messages = {
    created: `Your transfer request for ${amountLabel} (${params.reference}) is pending admin review.`,
    approved: `Your transfer ${params.reference} for ${amountLabel} was approved and posted to the ledger.`,
    failed: `Your transfer ${params.reference} for ${amountLabel} was declined during review.`,
    reversed: `Your transfer ${params.reference} for ${amountLabel} was reversed during review.`,
  } as const;

  return createNotification({
    userId: params.userId,
    type: "TRANSFER",
    title: titles[params.event],
    message: messages[params.event],
    metadata: {
      reference: params.reference,
      event: params.event,
      ...params.metadata,
    },
  });
}

export async function createSupportNotification(params: {
  userId: string;
  event: "created" | "updated";
  ticketId: string;
  subject: string;
  status: string;
}) {
  const title =
    params.event === "created" ? "Support ticket received" : "Support ticket updated";
  const message =
    params.event === "created"
      ? `We received your support ticket "${params.subject}".`
      : `Your support ticket "${params.subject}" is now ${params.status.toLowerCase()}.`;

  return createNotification({
    userId: params.userId,
    type: "SUPPORT",
    title,
    message,
    metadata: {
      ticketId: params.ticketId,
      status: params.status,
      href: "/support",
    },
  });
}

export async function createAccountNotification(params: {
  userId: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  return createNotification({
    userId: params.userId,
    type: "ACCOUNT",
    title: params.title,
    message: params.message,
    metadata: params.metadata,
  });
}

export async function createAdminActionNotification(params: {
  userId: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  return createNotification({
    userId: params.userId,
    type: "ADMIN",
    title: params.title,
    message: params.message,
    metadata: params.metadata,
  });
}
