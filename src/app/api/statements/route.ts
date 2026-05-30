import { NextRequest } from "next/server";
import { apiError, handleApiError } from "@/lib/api";
import { getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import {
  buildStatementFilename,
  fetchStatementExportData,
  parseStatementMonth,
  parseStatementYear,
  statementDataToCsv,
} from "@/lib/statementExport";
import { generateStatementPdfBuffer } from "@/lib/statementsPdf";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId") ?? undefined;
    const month = parseStatementMonth(searchParams.get("month"));
    const year = parseStatementYear(searchParams.get("year"));
    const format = searchParams.get("format") === "pdf" ? "pdf" : "csv";

    if (month === null || year === null) {
      return apiError("Invalid month or year", 400);
    }

    const statementData = await fetchStatementExportData({
      userId: payload.userId,
      accountId,
      month,
      year,
    });

    const filename = buildStatementFilename({
      format,
      year,
      month,
      accountLabel: accountId ? statementData.accountLabel : undefined,
    });

    if (format === "pdf") {
      const pdfBuffer = generateStatementPdfBuffer(statementData);

      return new Response(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store",
        },
      });
    }

    const csv = statementDataToCsv(statementData);

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Account not found") {
      return apiError(error.message, 404);
    }

    return handleApiError(error);
  }
}
