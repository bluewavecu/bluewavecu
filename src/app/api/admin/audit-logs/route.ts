import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { apiSuccess, handleApiError } from "@/lib/api";
import { getPrisma } from "@/lib/prisma";
import type { AdminAuditLogRecord } from "@/types/banking";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const logs = await getPrisma().adminAuditLog.findMany({
      include: {
        admin: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const serializedLogs: AdminAuditLogRecord[] = logs.map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      details: (log.details as Record<string, unknown> | null) ?? null,
      createdAt: log.createdAt.toISOString(),
      admin: log.admin,
    }));

    return apiSuccess({ logs: serializedLogs });
  } catch (error) {
    return handleApiError(error);
  }
}
