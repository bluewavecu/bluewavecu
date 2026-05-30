import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { apiSuccess, handleApiError } from "@/lib/api";
import { getReconciliationSummary } from "@/lib/reconciliation";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const summary = await getReconciliationSummary();

    return apiSuccess(summary);
  } catch (error) {
    return handleApiError(error);
  }
}
