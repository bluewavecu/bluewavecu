import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { apiSuccess, handleApiError } from "@/lib/api";
import { getFinanceReports } from "@/lib/financeReports";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const reports = await getFinanceReports({ from, to });

    return apiSuccess(reports);
  } catch (error) {
    return handleApiError(error);
  }
}
