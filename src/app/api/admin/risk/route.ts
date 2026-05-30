import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { apiSuccess, handleApiError } from "@/lib/api";
import { getPrisma } from "@/lib/prisma";
import type { Prisma, RiskSeverity } from "@/generated/prisma/client";
import type { AdminRiskData, RiskEventRecord } from "@/types/banking";

export const runtime = "nodejs";

function parseLimit(value: string | null) {
  if (!value) {
    return 50;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return 50;
  }

  return Math.min(parsed, 100);
}

function serializeRiskEvent(event: {
  id: string;
  userId: string;
  eventType: string;
  riskScore: number;
  severity: RiskSeverity;
  reason: string;
  metadata: unknown;
  createdAt: Date;
  user: { id: string; fullName: string; email: string };
}): RiskEventRecord {
  return {
    id: event.id,
    userId: event.userId,
    user: event.user,
    eventType: event.eventType,
    riskScore: event.riskScore,
    severity: event.severity,
    reason: event.reason,
    metadata:
      event.metadata && typeof event.metadata === "object"
        ? (event.metadata as Record<string, string | number | boolean | null>)
        : null,
    createdAt: event.createdAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get("limit"));
    const severity = searchParams.get("severity");
    const eventType = searchParams.get("eventType");

    const where: Prisma.RiskEventWhereInput = {};

    if (severity && ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(severity)) {
      where.severity = severity as RiskSeverity;
    }

    if (eventType) {
      where.eventType = eventType;
    }

    const prisma = getPrisma();

    const [events, total, highOrCritical] = await Promise.all([
      prisma.riskEvent.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.riskEvent.count({ where }),
      prisma.riskEvent.count({
        where: {
          ...where,
          severity: { in: ["HIGH", "CRITICAL"] },
        },
      }),
    ]);

    const data: AdminRiskData = {
      events: events.map(serializeRiskEvent),
      summary: {
        total,
        highOrCritical,
      },
    };

    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
