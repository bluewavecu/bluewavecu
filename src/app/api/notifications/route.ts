import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveRequestAuth } from "@/lib/requestAuth";

import { getPrisma } from "@/lib/prisma";
import type { NotificationRecord, NotificationsData } from "@/types/banking";

export const runtime = "nodejs";

function parseLimit(value: string | null) {
  if (!value) {
    return 20;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return 20;
  }

  return Math.min(parsed, 100);
}

function serializeNotification(notification: {
  id: string;
  type: NotificationRecord["type"];
  title: string;
  message: string;
  isRead: boolean;
  metadata: unknown;
  createdAt: Date;
}): NotificationRecord {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    isRead: notification.isRead,
    metadata:
      notification.metadata && typeof notification.metadata === "object"
        ? (notification.metadata as Record<string, string | number | boolean | null>)
        : null,
    createdAt: notification.createdAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get("limit"));
    const readFilter = searchParams.get("read");
    const prisma = getPrisma();

    const readWhere =
      readFilter === "read"
        ? { isRead: true }
        : readFilter === "unread"
          ? { isRead: false }
          : {};

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: payload.userId, ...readWhere },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({
        where: {
          userId: payload.userId,
          isRead: false,
        },
      }),
    ]);

    const data: NotificationsData = {
      notifications: notifications.map(serializeNotification),
      unreadCount,
    };

    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
