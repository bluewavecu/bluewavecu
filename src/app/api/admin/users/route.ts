import { NextRequest } from "next/server";
import { logAdminAction, requireAdmin } from "@/lib/admin";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { sanitizeUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { createAccountNotification } from "@/lib/notifications";
import { writeAdminEvent } from "@/lib/eventLog";
import { adminUpdateUserStatusSchema } from "@/lib/validators";
import type { AdminUserSummaryWithKyc, UserRole, UserStatus, KycStatus } from "@/types/banking";

export const runtime = "nodejs";

function serializeUser(user: {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  customerProfile?: { kycStatus: KycStatus } | null;
}): AdminUserSummaryWithKyc {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    kycStatus: user.customerProfile?.kycStatus ?? null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as UserStatus | null;
    const role = searchParams.get("role") as UserRole | null;
    const kycStatus = searchParams.get("kycStatus") as KycStatus | null;
    const search = searchParams.get("search")?.trim();

    const users = await getPrisma().user.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(role ? { role } : {}),
        ...(kycStatus
          ? {
              customerProfile: { kycStatus },
            }
          : {}),
        ...(search
          ? {
              OR: [
                { email: { contains: search, mode: "insensitive" } },
                { fullName: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        customerProfile: { select: { kycStatus: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return apiSuccess({
      users: users.map(serializeUser),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const input = adminUpdateUserStatusSchema.parse(await request.json());
    const prisma = getPrisma();

    const existing = await prisma.user.findUnique({
      where: { id: input.userId },
    });

    if (!existing) {
      return apiError("User not found", 404);
    }

    const updated = await prisma.user.update({
      where: { id: input.userId },
      data: { status: input.status },
    });

    await logAdminAction({
      adminId: auth.admin.id,
      action: "UPDATE_USER_STATUS",
      entityType: "User",
      entityId: updated.id,
      details: {
        previousStatus: existing.status,
        nextStatus: updated.status,
        email: updated.email,
      },
    });

    void createAccountNotification({
      userId: updated.id,
      title: "Account status updated",
      message: `Your Bluewave membership status is now ${updated.status.toLowerCase()}.`,
      metadata: {
        status: updated.status,
        href: "/dashboard",
      },
    });

    void writeAdminEvent({
      eventType: "USER_STATUS_UPDATED",
      actorId: auth.admin.id,
      entityId: updated.id,
      message: `User status changed from ${existing.status} to ${updated.status}.`,
      metadata: { previousStatus: existing.status, nextStatus: updated.status },
    });

    return apiSuccess({ user: sanitizeUser(updated) });
  } catch (error) {
    return handleApiError(error);
  }
}
