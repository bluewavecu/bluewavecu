import type { NextRequest } from "next/server";
import { apiError } from "@/lib/api";
import { getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import { SESSION_EXPIRED_MESSAGE } from "@/lib/sessionPolicy";
import { validateAndTouchSession } from "@/lib/sessions";
import type { AuthTokenPayload } from "@/types/banking";

export type RequestAuthResult =
  | { ok: true; payload: AuthTokenPayload }
  | { ok: false; response: ReturnType<typeof apiError> };

export async function resolveRequestAuth(
  request: NextRequest,
  options?: { touch?: boolean },
): Promise<RequestAuthResult> {
  const token = getAuthTokenFromRequest(request);

  if (!token) {
    return { ok: false, response: apiError("Authentication required", 401) };
  }

  const payload = verifyAuthToken(token);

  if (!payload) {
    return { ok: false, response: apiError("Invalid or expired token", 401) };
  }

  if (!payload.sessionId) {
    return { ok: false, response: apiError(SESSION_EXPIRED_MESSAGE, 401) };
  }

  const session = await validateAndTouchSession(payload.sessionId, options);

  if (!session.ok) {
    return { ok: false, response: apiError(SESSION_EXPIRED_MESSAGE, 401) };
  }

  return { ok: true, payload };
}
