import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveRequestAuth } from "@/lib/requestAuth";

import { softDeletePayee, updatePayee } from "@/lib/billPay";
import { payeeUpdateSchema } from "@/lib/validators";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const { id } = await context.params;
    const input = payeeUpdateSchema.parse(await request.json());
    const payee = await updatePayee(payload.userId, id, input);

    return apiSuccess({ payee });
  } catch (error) {
    if (error instanceof Error && error.message === "Payee not found") {
      return apiError("Payee not found", 404);
    }

    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const { id } = await context.params;
    const deleted = await softDeletePayee(payload.userId, id);

    if (!deleted) {
      return apiError("Payee not found", 404);
    }

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
