import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { apiSuccess, handleApiError } from "@/lib/api";
import { getReconciliationSummary } from "@/lib/reconciliation";
import { writeEventLog } from "@/lib/eventLog";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const summary = await getReconciliationSummary();

    if (summary.totals.mismatchCount > 0) {
      void writeEventLog({
        eventType: "RECONCILIATION_MISMATCH",
        entityType: "Reconciliation",
        message: `${summary.totals.mismatchCount} account balance mismatches detected.`,
        severity: "WARNING",
        metadata: {
          mismatchCount: summary.totals.mismatchCount,
          accountCount: summary.totals.accountCount,
        },
      });
    }

    return apiSuccess(summary);
  } catch (error) {
    return handleApiError(error);
  }
}
