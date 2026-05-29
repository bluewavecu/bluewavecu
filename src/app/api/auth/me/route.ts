import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { getAuthTokenFromRequest, sanitizeUser, verifyAuthToken } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);

    if (!token) {
      return apiError("Authentication required", 401);
    }

    const payload = verifyAuthToken(token);

    if (!payload) {
      return apiError("Invalid or expired token", 401);
    }

    const user = await getPrisma().user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    return apiSuccess({
      user: sanitizeUser(user),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
