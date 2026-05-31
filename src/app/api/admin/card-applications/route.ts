import { NextRequest } from "next/server";
import { logAdminAction, requireAdmin } from "@/lib/admin";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { reviewCardApplication, serializeCardApplication } from "@/lib/cardApplications";
import { getPrisma } from "@/lib/prisma";
import { adminReviewCardApplicationSchema } from "@/lib/validators";
import type { AdminCardApplicationRecord, AdminCardApplicationsData, CardApplicationStatus } from "@/types/banking";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where =
      status && status !== "ALL"
        ? { status: status as CardApplicationStatus }
        : {};

    const prisma = getPrisma();
    const [applications, pendingCount, totalCount] = await Promise.all([
      prisma.cardApplication.findMany({
        where,
        include: {
          account: {
            select: {
              accountType: true,
              accountNumber: true,
            },
          },
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.cardApplication.count({ where: { status: "PENDING" } }),
      prisma.cardApplication.count(),
    ]);

    const serialized: AdminCardApplicationRecord[] = applications.map((application) => ({
      ...serializeCardApplication(application),
      user: application.user,
    }));

    const data: AdminCardApplicationsData = {
      applications: serialized,
      summary: {
        pending: pendingCount,
        total: totalCount,
      },
    };

    return apiSuccess(data);
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

    const input = adminReviewCardApplicationSchema.parse(await request.json());

    const application = await reviewCardApplication({
      applicationId: input.applicationId,
      adminId: auth.admin.id,
      action: input.action,
      reviewNote: input.reviewNote,
      spendingLimit: input.spendingLimit,
    });

    void logAdminAction({
      adminId: auth.admin.id,
      action: input.action === "APPROVE" ? "CARD_APPLICATION_APPROVED" : "CARD_APPLICATION_DECLINED",
      entityType: "CardApplication",
      entityId: input.applicationId,
      details: {
        reviewNote: input.reviewNote ?? null,
      },
    });

    return apiSuccess({ application });
  } catch (error) {
    if (error instanceof Error && error.message) {
      return apiError(error.message, 400);
    }

    return handleApiError(error);
  }
}
