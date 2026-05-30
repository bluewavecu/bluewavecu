import { NextRequest } from "next/server";
import { logAdminAction, requireAdmin } from "@/lib/admin";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { serializeDispute, updateDisputeStatus } from "@/lib/disputes";
import { getPrisma } from "@/lib/prisma";
import { adminDisputeUpdateSchema } from "@/lib/validators";
import type { AdminDisputesData, DisputeStatus } from "@/types/banking";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: { status?: DisputeStatus } = {};

    if (status && status !== "ALL") {
      where.status = status as DisputeStatus;
    }

    const [disputes, open, underReview, total] = await Promise.all([
      getPrisma().dispute.findMany({
        where,
        include: {
          transaction: {
            select: {
              reference: true,
              amount: true,
              description: true,
              merchant: true,
              status: true,
            },
          },
          user: { select: { fullName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      getPrisma().dispute.count({ where: { status: "OPEN" } }),
      getPrisma().dispute.count({ where: { status: "UNDER_REVIEW" } }),
      getPrisma().dispute.count(),
    ]);

    const data: AdminDisputesData = {
      disputes: disputes.map(serializeDispute),
      summary: { open, underReview, total },
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

    const input = adminDisputeUpdateSchema.parse(await request.json());

    const dispute = await updateDisputeStatus({
      disputeId: input.disputeId,
      status: input.status,
      resolutionNote: input.resolutionNote,
      actorId: auth.admin.id,
      isAdmin: true,
    });

    await logAdminAction({
      adminId: auth.admin.id,
      action: "UPDATE_DISPUTE",
      entityType: "Dispute",
      entityId: input.disputeId,
      details: {
        status: input.status,
        resolutionNote: input.resolutionNote ?? null,
      },
    });

    return apiSuccess({ dispute });
  } catch (error) {
    if (error instanceof Error && error.message === "Dispute not found") {
      return apiError(error.message, 404);
    }

    return handleApiError(error);
  }
}
