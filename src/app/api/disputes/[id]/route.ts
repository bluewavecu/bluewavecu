import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import { closeDisputeByUser } from "@/lib/disputes";
import { disputeUpdateSchema } from "@/lib/validators";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Unauthorized", 401);
    }

    const { id } = await context.params;
    const input = disputeUpdateSchema.parse(await request.json());

    if (input.action !== "close") {
      return apiError("Unsupported action", 400);
    }

    const dispute = await closeDisputeByUser(payload.userId, id);

    return apiSuccess({ dispute });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Dispute not found") {
        return apiError(error.message, 404);
      }

      if (error.message.includes("only close")) {
        return apiError(error.message, 400);
      }
    }

    return handleApiError(error);
  }
}
