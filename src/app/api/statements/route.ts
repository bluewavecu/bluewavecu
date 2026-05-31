import { NextRequest } from "next/server";
import { apiError, handleApiError } from "@/lib/api";
import { resolveRequestAuth } from "@/lib/requestAuth";

import {
  buildStatementFilename,
  fetchStatementExportData,
  parseStatementMonth,
  parseStatementPeriodValue,
  parseStatementYear,
  resolveStatementPeriod,
  statementDataToCsv,
} from "@/lib/statementExport";
import { generateStatementPdfBuffer } from "@/lib/statementsPdf";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId") ?? undefined;
    const format = searchParams.get("format") === "pdf" ? "pdf" : "csv";

    const fromPeriod = parseStatementPeriodValue(searchParams.get("fromPeriod"));
    const toPeriod = parseStatementPeriodValue(searchParams.get("toPeriod"));
    const month = parseStatementMonth(searchParams.get("month"));
    const year = parseStatementYear(searchParams.get("year"));

    const period = resolveStatementPeriod({
      fromMonth: fromPeriod?.month,
      fromYear: fromPeriod?.year,
      toMonth: toPeriod?.month,
      toYear: toPeriod?.year,
      month,
      year,
    });

    if (!period) {
      return apiError("Invalid statement period. Choose a range from January 2025 through June 2026.", 400);
    }

    const statementData = await fetchStatementExportData({
      userId: payload.userId,
      accountId,
      period,
    });

    const filename = buildStatementFilename({
      format,
      period,
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
