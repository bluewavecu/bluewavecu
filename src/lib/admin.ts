import type { NextRequest } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { apiError } from "@/lib/api";
import { getAuthTokenFromRequest, sanitizeUser, verifyAuthToken } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import type { SafeUser } from "@/types/banking";

export type AdminAuthResult =
  | { ok: true; admin: SafeUser }
  | { ok: false; response: ReturnType<typeof apiError> };

export async function requireAdmin(request: NextRequest): Promise<AdminAuthResult> {
  const token = getAuthTokenFromRequest(request);
  const payload = token ? verifyAuthToken(token) : null;

  if (!payload) {
    return { ok: false, response: apiError("Unauthorized", 401) };
  }

  if (payload.role !== "ADMIN") {
    return { ok: false, response: apiError("Forbidden", 403) };
  }

  const user = await getPrisma().user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || user.role !== "ADMIN") {
    return { ok: false, response: apiError("Forbidden", 403) };
  }

  return { ok: true, admin: sanitizeUser(user) };
}

export async function logAdminAction(params: {
  adminId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Prisma.InputJsonValue;
}) {
  await getPrisma().adminAuditLog.create({
    data: {
      adminId: params.adminId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details,
    },
  });
}
