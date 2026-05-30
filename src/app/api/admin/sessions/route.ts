import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { apiSuccess, handleApiError } from "@/lib/api";
import { getPrisma } from "@/lib/prisma";
import type { AdminSessionsData } from "@/types/banking";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "1";
    const userId = searchParams.get("userId")?.trim();

    const sessions = await getPrisma().userSession.findMany({
      where: {
        ...(activeOnly ? { isActive: true } : {}),
        ...(userId ? { userId } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            status: true,
          },
        },
      },
      orderBy: { lastSeenAt: "desc" },
      take: 100,
    });

    const active = sessions.filter((session) => session.isActive).length;

    const data: AdminSessionsData = {
      sessions: sessions.map((session) => ({
        id: session.id,
        deviceName: session.deviceName,
        ipAddress: session.ipAddress,
        location: session.location,
        isActive: session.isActive,
        lastSeenAt: session.lastSeenAt.toISOString(),
        createdAt: session.createdAt.toISOString(),
        revokedAt: session.revokedAt?.toISOString() ?? null,
        user: session.user,
      })),
      summary: {
        active,
        total: sessions.length,
      },
    };

    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
