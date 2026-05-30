import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { apiSuccess, handleApiError } from "@/lib/api";
import { getPrisma } from "@/lib/prisma";
import type { JobStatus } from "@/types/banking";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const jobType = searchParams.get("jobType");

    const where: {
      status?: JobStatus;
      jobType?: string;
    } = {};

    if (status && status !== "ALL") {
      where.status = status as JobStatus;
    }

    if (jobType && jobType !== "ALL") {
      where.jobType = jobType;
    }

    const [jobs, summary] = await Promise.all([
      getPrisma().jobQueue.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      getPrisma().jobQueue.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);

    return apiSuccess({
      jobs: jobs.map((job) => ({
        id: job.id,
        jobType: job.jobType,
        status: job.status,
        runAt: job.runAt.toISOString(),
        attempts: job.attempts,
        maxAttempts: job.maxAttempts,
        payload: job.payload,
        error: job.error,
        lockedAt: job.lockedAt?.toISOString() ?? null,
        completedAt: job.completedAt?.toISOString() ?? null,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
      })),
      summary: {
        byStatus: Object.fromEntries(summary.map((row) => [row.status, row._count._all])),
        total: summary.reduce((sum, row) => sum + row._count._all, 0),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
