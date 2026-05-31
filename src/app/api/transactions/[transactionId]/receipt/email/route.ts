import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveRequestAuth } from "@/lib/requestAuth";
import { sendTransactionReceiptEmail } from "@/lib/email";
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

export async function POST(request: NextRequest, context: RouteContext) {
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

    const emailResult = await sendTransactionReceiptEmail({
      email: receiptData.memberEmail,
      fullName: receiptData.memberName,
      reference: receiptData.reference,
      amount: receiptData.amount,
      filename,
      pdfBuffer,
    });

    if (!emailResult.ok) {
      const message =
        "error" in emailResult && emailResult.error
          ? emailResult.error
          : "Unable to email receipt.";
      return apiError(message, 502);
    }

    return apiSuccess({
      message: `Receipt emailed to ${receiptData.memberEmail}.`,
      mode: emailResult.mode,
    });
  } catch (error) {
    if (error instanceof TransactionReceiptError) {
      return apiError(error.message, error.status);
    }

    return handleApiError(error);
  }
}
