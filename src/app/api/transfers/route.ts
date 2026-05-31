import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveRequestAuth } from "@/lib/requestAuth";

import { enforceRateLimit, rateLimitPresets } from "@/lib/rateLimit";
import { submitMemberTransfer, TransferRequestError } from "@/lib/transfers";
import { transferSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const rateLimit = enforceRateLimit(request, "transfers", rateLimitPresets.transfer);

    if (!rateLimit.allowed) {
      return apiError(rateLimit.message, 429);
    }

    const input = transferSchema.parse(await request.json());
    const result = await submitMemberTransfer({
      userId: payload.userId,
      input,
      transactionPin: input.transactionPin,
    });

    return apiSuccess(result, { status: 201 });
  } catch (error) {
    if (error instanceof TransferRequestError) {
      return apiError(error.message, error.status);
    }

    return handleApiError(error);
  }
}
