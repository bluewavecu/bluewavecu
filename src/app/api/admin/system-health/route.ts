import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { apiSuccess, handleApiError } from "@/lib/api";
import { getEmailConfig } from "@/lib/email";
import { serializeEventLog } from "@/lib/eventLog";
import { tryGetServerEnv } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { getReconciliationMetrics } from "@/lib/reconciliation";
import type { AdminSystemHealthData } from "@/types/banking";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const prisma = getPrisma();
    const now = new Date();
    const serverEnv = tryGetServerEnv();
    const emailConfig = getEmailConfig();

    const [dueJobs, failedJobs, runningJobs, totalJobs, recentCronEvents, reconciliation] =
      await Promise.all([
        prisma.jobQueue.count({ where: { status: "QUEUED", runAt: { lte: now } } }),
        prisma.jobQueue.count({ where: { status: "FAILED" } }),
        prisma.jobQueue.count({ where: { status: "RUNNING" } }),
        prisma.jobQueue.count(),
        prisma.eventLog.findMany({
          where: {
            OR: [
              { eventType: { startsWith: "CRON_" } },
              { eventType: { startsWith: "WORKER_" } },
            ],
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        getReconciliationMetrics(),
      ]);

    const mismatchCount = reconciliation.mismatchCount;
    const noLedgerCount = reconciliation.noLedgerCount;

    let status: AdminSystemHealthData["status"] = "healthy";

    if (failedJobs > 0 || mismatchCount > 0) {
      status = "degraded";
    }

    if (failedJobs > 5 || mismatchCount > 3) {
      status = "critical";
    }

    const data: AdminSystemHealthData = {
      status,
      database: "connected",
      emailConfigured: Boolean(emailConfig.resendApiKey && emailConfig.adminAlertEmail),
      cronConfigured: Boolean(process.env.CRON_SECRET?.trim()),
      demoSeedProtected: process.env.ALLOW_DEMO_SEED !== "true",
      appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000",
      systemMode: serverEnv?.NODE_ENV ?? process.env.NODE_ENV ?? "production",
      jobs: {
        due: dueJobs,
        failed: failedJobs,
        running: runningJobs,
        total: totalJobs,
      },
      reconciliation: {
        mismatchCount,
        noLedgerCount,
      },
      recentCronEvents: recentCronEvents.map(serializeEventLog),
    };

    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
