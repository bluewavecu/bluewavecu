import { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api";
import { clearAuthCookie, getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import { revokeUserSession } from "@/lib/sessions";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (payload?.sessionId) {
      await revokeUserSession(payload.userId, payload.sessionId);
    }

    const response = apiSuccess({ message: "Signed out successfully." });
    response.cookies.set(clearAuthCookie());
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
