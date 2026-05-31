import type { NextRequest } from "next/server";
import { apiError } from "@/lib/api";
import { getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { SESSION_EXPIRED_MESSAGE } from "@/lib/sessionPolicy";
import { validateAndTouchSession } from "@/lib/sessions";
import { getAccountModificationBlockMessage } from "@/lib/userAccess";
import type { AuthTokenPayload } from "@/types/banking";

export type RequestAuthResult =
  | { ok: true; payload: AuthTokenPayload }
  | { ok: false; response: ReturnType<typeof apiError> };

type ResolveRequestAuthOptions = {
  touch?: boolean;
  requireWriteAccess?: boolean;
};

export async function resolveRequestAuth(
  request: NextRequest,
  options?: ResolveRequestAuthOptions,
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

  if (options?.requireWriteAccess && payload.role === "USER") {
    const user = await getPrisma().user.findUnique({
      where: { id: payload.userId },
      select: { status: true, deletedAt: true },
    });

    if (!user) {
      return { ok: false, response: apiError("User not found", 404) };
    }

    const modificationBlockMessage = getAccountModificationBlockMessage({
      status: user.status,
      deletedAt: user.deletedAt,
    });

    if (modificationBlockMessage) {
      return { ok: false, response: apiError(modificationBlockMessage, 403) };
    }
  }

  return { ok: true, payload };
}

export async function resolveMemberWriteAuth(request: NextRequest) {
  return resolveRequestAuth(request, { requireWriteAccess: true });
}
