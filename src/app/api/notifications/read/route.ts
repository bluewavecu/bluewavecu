import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveRequestAuth } from "@/lib/requestAuth";

import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications";

export const runtime = "nodejs";

const readSchema = z
  .object({
    notificationId: z.string().min(1).optional(),
    markAll: z.boolean().optional(),
  })
  .refine((data) => Boolean(data.notificationId || data.markAll), {
    message: "notificationId or markAll is required",
  });

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const input = readSchema.parse(await request.json());

    if (input.markAll) {
      const updatedCount = await markAllNotificationsRead(payload.userId);
      return apiSuccess({ updatedCount, markAll: true });
    }

    if (!input.notificationId) {
      return apiError("notificationId is required", 400);
    }

    const updated = await markNotificationRead(payload.userId, input.notificationId);

    if (!updated) {
      return apiError("Notification not found", 404);
    }

    return apiSuccess({ notificationId: input.notificationId, isRead: true });
  } catch (error) {
    return handleApiError(error);
  }
}
