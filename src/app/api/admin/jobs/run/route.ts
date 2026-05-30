import { NextRequest } from "next/server";
import { logAdminAction, requireAdmin } from "@/lib/admin";
import { apiSuccess, handleApiError } from "@/lib/api";
import { runDueJobs } from "@/lib/worker";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const summary = await runDueJobs();

    await logAdminAction({
      adminId: auth.admin.id,
      action: "RUN_DUE_JOBS",
      entityType: "JobQueue",
      entityId: "batch",
      details: {
        processed: summary.processed,
        completed: summary.completed,
        failed: summary.failed,
      },
    });

    return apiSuccess(summary);
  } catch (error) {
    return handleApiError(error);
  }
}
