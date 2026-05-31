import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveRequestAuth } from "@/lib/requestAuth";
import { clearAuthCookie } from "@/lib/auth";
import { revokeUserSession } from "@/lib/sessions";
import { sessionRevokeSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const input = sessionRevokeSchema.parse(await request.json());
    const revoked = await revokeUserSession(payload.userId, input.sessionId);

    if (!revoked) {
      return apiError("Session not found or already revoked", 404);
    }

    const response = apiSuccess({
      sessionId: input.sessionId,
      revoked: true,
      loggedOut: input.sessionId === payload.sessionId,
    });

    if (input.sessionId === payload.sessionId) {
      response.cookies.set(clearAuthCookie());
    }

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
