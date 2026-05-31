import { randomUUID } from "crypto";
import type { NextRequest } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { deriveDeviceName, getClientIp, getUserAgent } from "@/lib/requestContext";
import { SESSION_INACTIVITY_TIMEOUT_MS } from "@/lib/sessionPolicy";

export { SESSION_INACTIVITY_TIMEOUT_MS } from "@/lib/sessionPolicy";

export async function createUserSession(params: {
  userId: string;
  request: NextRequest;
}) {
  const ipAddress = getClientIp(params.request);
  const userAgent = getUserAgent(params.request);
  const tokenId = randomUUID();

  return getPrisma().userSession.create({
    data: {
      userId: params.userId,
      tokenId,
      deviceName: deriveDeviceName(userAgent),
      ipAddress,
      userAgent,
      location: "Unknown",
      isActive: true,
      lastSeenAt: new Date(),
    },
  });
}

export async function touchUserSession(sessionId: string) {
  await getPrisma().userSession.updateMany({
    where: {
      id: sessionId,
      isActive: true,
    },
    data: {
      lastSeenAt: new Date(),
    },
  });
}

export async function validateAndTouchSession(
  sessionId: string,
  options?: { touch?: boolean },
) {
  const prisma = getPrisma();
  const session = await prisma.userSession.findFirst({
    where: {
      id: sessionId,
      isActive: true,
    },
    select: {
      id: true,
      lastSeenAt: true,
    },
  });

  if (!session) {
    return { ok: false as const, reason: "revoked" as const };
  }

  const idleMs = Date.now() - session.lastSeenAt.getTime();

  if (idleMs > SESSION_INACTIVITY_TIMEOUT_MS) {
    await prisma.userSession.update({
      where: { id: session.id },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
    });
    return { ok: false as const, reason: "inactive" as const };
  }

  if (options?.touch !== false) {
    await touchUserSession(sessionId);
  }

  return { ok: true as const };
}

export async function revokeUserSession(userId: string, sessionId: string) {
  const result = await getPrisma().userSession.updateMany({
    where: {
      id: sessionId,
      userId,
      isActive: true,
    },
    data: {
      isActive: false,
      revokedAt: new Date(),
    },
  });

  return result.count > 0;
}

export async function revokeAllUserSessions(userId: string) {
  await getPrisma().userSession.updateMany({
    where: {
      userId,
      isActive: true,
    },
    data: {
      isActive: false,
      revokedAt: new Date(),
    },
  });
}

export async function isSessionActive(sessionId: string) {
  const session = await getPrisma().userSession.findFirst({
    where: {
      id: sessionId,
      isActive: true,
    },
    select: { id: true },
  });

  return Boolean(session);
}
