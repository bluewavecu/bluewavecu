import { NextRequest } from "next/server";
import { apiError, handleApiError } from "@/lib/api";
import { resolveRequestAuth } from "@/lib/requestAuth";
import {
  TransactionReceiptError,
  buildTransactionReceiptFilename,
  fetchTransactionReceiptData,
} from "@/lib/transactionReceiptExport";
import { generateTransactionReceiptPdfBuffer } from "@/lib/transactionReceiptPdf";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ transactionId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }

    const { transactionId } = await context.params;
    const receiptData = await fetchTransactionReceiptData({
      userId: auth.payload.userId,
      transactionId,
    });
    const pdfBuffer = generateTransactionReceiptPdfBuffer(receiptData);
    const filename = buildTransactionReceiptFilename(receiptData.reference);

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof TransactionReceiptError) {
      return apiError(error.message, error.status);
    }

    return handleApiError(error);
  }
}
