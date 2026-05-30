import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import type { UserSessionRecord, UserSessionsData } from "@/types/banking";

export const runtime = "nodejs";

function serializeSession(
  session: {
    id: string;
    deviceName: string;
    ipAddress: string;
    userAgent: string;
    location: string | null;
    isActive: boolean;
    lastSeenAt: Date;
    createdAt: Date;
    revokedAt: Date | null;
  },
  currentSessionId?: string,
): UserSessionRecord {
  return {
    id: session.id,
    deviceName: session.deviceName,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
    location: session.location,
    isActive: session.isActive,
    isCurrent: session.id === currentSessionId,
    lastSeenAt: session.lastSeenAt.toISOString(),
    createdAt: session.createdAt.toISOString(),
    revokedAt: session.revokedAt?.toISOString() ?? null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Unauthorized", 401);
    }

    const sessions = await getPrisma().userSession.findMany({
      where: { userId: payload.userId },
      orderBy: { lastSeenAt: "desc" },
      take: 25,
    });

    const data: UserSessionsData = {
      sessions: sessions.map((session) => serializeSession(session, payload.sessionId)),
    };

    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
