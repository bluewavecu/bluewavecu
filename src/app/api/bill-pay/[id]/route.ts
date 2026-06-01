import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveMemberWriteAuth } from "@/lib/requestAuth";

import { BillPayPausedError } from "@/lib/billPayAccess";
import { cancelBillPayment, submitBillPaymentForReview } from "@/lib/billPay";
import { billPaymentUpdateSchema } from "@/lib/validators";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const auth = await resolveMemberWriteAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const { id } = await context.params;
    const input = billPaymentUpdateSchema.parse(await request.json());

    const billPayment =
      input.action === "cancel"
        ? await cancelBillPayment(payload.userId, id)
        : await submitBillPaymentForReview(payload.userId, id);

    return apiSuccess({ billPayment });
  } catch (error) {
    if (error instanceof BillPayPausedError) {
      return apiError(error.message, 403);
    }

    if (error instanceof Error && error.message.includes("not found")) {
      return apiError(error.message, 404);
    }

    return handleApiError(error);
  }
}
