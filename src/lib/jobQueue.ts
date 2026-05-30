import type { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";

export type JobPayload = Record<string, string | number | boolean | null>;

function sanitizePayload(payload: JobPayload): Prisma.InputJsonValue {
  return payload;
}

export async function enqueueJob(params: {
  jobType: string;
  runAt: Date;
  payload: JobPayload;
  maxAttempts?: number;
}) {
  return getPrisma().jobQueue.create({
    data: {
      jobType: params.jobType,
      runAt: params.runAt,
      payload: sanitizePayload(params.payload),
      maxAttempts: params.maxAttempts ?? 3,
      status: "QUEUED",
    },
  });
}

export async function getDueJobs(limit = 25) {
  return getPrisma().jobQueue.findMany({
    where: {
      status: "QUEUED",
      runAt: { lte: new Date() },
    },
    orderBy: { runAt: "asc" },
    take: limit,
  });
}

export async function markJobRunning(jobId: string) {
  return getPrisma().jobQueue.updateMany({
    where: {
      id: jobId,
      status: "QUEUED",
    },
    data: {
      status: "RUNNING",
      lockedAt: new Date(),
      attempts: { increment: 1 },
    },
  });
}

export async function markJobCompleted(jobId: string) {
  return getPrisma().jobQueue.update({
    where: { id: jobId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      error: null,
    },
  });
}

export async function markJobFailed(jobId: string, error: string) {
  const job = await getPrisma().jobQueue.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    return null;
  }

  const shouldRetry = job.attempts < job.maxAttempts;

  return getPrisma().jobQueue.update({
    where: { id: jobId },
    data: {
      status: shouldRetry ? "QUEUED" : "FAILED",
      error,
      lockedAt: null,
    },
  });
}

export async function cancelJob(jobId: string) {
  return getPrisma().jobQueue.updateMany({
    where: {
      id: jobId,
      status: { in: ["QUEUED", "RUNNING"] },
    },
    data: {
      status: "CANCELLED",
    },
  });
}
