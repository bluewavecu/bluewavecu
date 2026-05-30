import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { apiSuccess, handleApiError } from "@/lib/api";
import { serializeEventLog } from "@/lib/eventLog";
import { getPrisma } from "@/lib/prisma";
import type { EventLogsData, EventSeverity } from "@/types/banking";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity");
    const eventType = searchParams.get("eventType");
    const entityType = searchParams.get("entityType");

    const where: {
      severity?: EventSeverity;
      eventType?: string;
      entityType?: string;
    } = {};

    if (severity && severity !== "ALL") {
      where.severity = severity as EventSeverity;
    }

    if (eventType && eventType !== "ALL") {
      where.eventType = eventType;
    }

    if (entityType && entityType !== "ALL") {
      where.entityType = entityType;
    }

    const [events, severityGroups, total] = await Promise.all([
      getPrisma().eventLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      getPrisma().eventLog.groupBy({
        by: ["severity"],
        _count: { _all: true },
      }),
      getPrisma().eventLog.count({ where }),
    ]);

    const data: EventLogsData = {
      events: events.map(serializeEventLog),
      summary: {
        total,
        bySeverity: Object.fromEntries(
          severityGroups.map((row) => [row.severity, row._count._all]),
        ),
      },
    };

    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
