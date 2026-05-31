import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveRequestAuth } from "@/lib/requestAuth";

import { getCardTransactions } from "@/lib/cardApplications";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ cardId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const { cardId } = await context.params;
    const transactions = await getCardTransactions(cardId, payload.userId);

    return apiSuccess({ transactions });
  } catch (error) {
    return handleApiError(error);
  }
}
