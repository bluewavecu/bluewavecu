import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { getAuthTokenFromRequest, sanitizeUser, verifyAuthToken } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Authentication required", 401);
    }

    if (payload.role !== "ADMIN") {
      return apiError("Admin access required", 403);
    }

    const users = await getPrisma().user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return apiSuccess({
      users: users.map(sanitizeUser),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
