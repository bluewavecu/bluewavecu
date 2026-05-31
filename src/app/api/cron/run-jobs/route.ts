import { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api";
import { verifyCronSecret } from "@/lib/cronAuth";
import { writeEventLog, writeSystemErrorEvent } from "@/lib/eventLog";
import { runDueJobs } from "@/lib/worker";

export const runtime = "nodejs";

async function handleCronRun(request: NextRequest) {
  try {
    const auth = verifyCronSecret(request);

    if (!auth.ok) {
      return auth.response;
    }

    void writeEventLog({
      eventType: "CRON_RUN_STARTED",
      entityType: "Cron",
      message: "Scheduled cron job runner started.",
      severity: "INFO",
    });

    const summary = await runDueJobs();

    void writeEventLog({
      eventType: "CRON_RUN_COMPLETED",
      entityType: "Cron",
      message: `Cron job runner completed. Processed ${summary.processed}, completed ${summary.completed}, failed ${summary.failed}.`,
      severity: summary.failed > 0 ? "WARNING" : "INFO",
      metadata: {
        processed: summary.processed,
        completed: summary.completed,
        failed: summary.failed,
      },
    });

    return apiSuccess(summary);
  } catch (error) {
    void writeSystemErrorEvent({
      eventType: "CRON_RUN_FAILED",
      message: error instanceof Error ? error.message : "Cron job runner failed.",
      entityType: "Cron",
    });

    return handleApiError(error);
  }
}

/** Vercel Cron invokes scheduled jobs with GET. Manual/Render callers may use POST. */
export async function GET(request: NextRequest) {
  return handleCronRun(request);
}

export async function POST(request: NextRequest) {
  return handleCronRun(request);
}
