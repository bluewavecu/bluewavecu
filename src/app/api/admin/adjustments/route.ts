import { NextRequest } from "next/server";
import { logAdminAction, requireAdmin } from "@/lib/admin";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import {
  approveAdjustmentRequest,
  createAdjustmentRequest,
  LedgerError,
  postAdjustmentRequest,
  rejectAdjustmentRequest,
  serializeAdjustment,
} from "@/lib/adjustments";
import { getPrisma } from "@/lib/prisma";
import { adjustmentCreateSchema, adminAdjustmentActionSchema } from "@/lib/validators";
import type { AdjustmentStatus, AdjustmentsData } from "@/types/banking";

export const runtime = "nodejs";

function handleAdjustmentError(error: LedgerError) {
  if (error.code === "NOT_FOUND") {
    return apiError(error.message, 404);
  }

  if (error.code === "INSUFFICIENT_FUNDS") {
    return apiError(error.message, 400);
  }

  return apiError(error.message, 400);
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: { status?: AdjustmentStatus } = {};

    if (status && status !== "ALL") {
      where.status = status as AdjustmentStatus;
    }

    const [adjustments, pending, approved, total] = await Promise.all([
      getPrisma().adjustmentRequest.findMany({
        where,
        include: {
          account: { select: { accountNumber: true, accountType: true } },
          user: { select: { fullName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      getPrisma().adjustmentRequest.count({ where: { status: "PENDING" } }),
      getPrisma().adjustmentRequest.count({ where: { status: "APPROVED" } }),
      getPrisma().adjustmentRequest.count(),
    ]);

    const data: AdjustmentsData = {
      adjustments: adjustments.map(serializeAdjustment),
      summary: { pending, approved, total },
    };

    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const input = adjustmentCreateSchema.parse(await request.json());

    const adjustment = await createAdjustmentRequest({
      adminId: auth.admin.id,
      accountId: input.accountId,
      amount: input.amount,
      direction: input.direction,
      reason: input.reason,
    });

    await logAdminAction({
      adminId: auth.admin.id,
      action: "CREATE_ADJUSTMENT",
      entityType: "AdjustmentRequest",
      entityId: adjustment.id,
      details: {
        direction: input.direction,
        amount: input.amount,
      },
    });

    return apiSuccess({ adjustment }, { status: 201 });
  } catch (error) {
    if (error instanceof LedgerError) {
      return handleAdjustmentError(error);
    }

    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const input = adminAdjustmentActionSchema.parse(await request.json());

    if (input.action === "APPROVE") {
      const adjustment = await approveAdjustmentRequest({
        adjustmentId: input.adjustmentId,
        adminId: auth.admin.id,
        reviewNote: input.reviewNote,
      });

      return apiSuccess({ adjustment });
    }

    if (input.action === "REJECT") {
      const adjustment = await rejectAdjustmentRequest({
        adjustmentId: input.adjustmentId,
        adminId: auth.admin.id,
        reviewNote: input.reviewNote,
      });

      return apiSuccess({ adjustment });
    }

    const adjustment = await postAdjustmentRequest({
      adjustmentId: input.adjustmentId,
      adminId: auth.admin.id,
    });

    await logAdminAction({
      adminId: auth.admin.id,
      action: "POST_ADJUSTMENT",
      entityType: "AdjustmentRequest",
      entityId: input.adjustmentId,
      details: { transactionId: adjustment.transactionId },
    });

    return apiSuccess({ adjustment });
  } catch (error) {
    if (error instanceof LedgerError) {
      return handleAdjustmentError(error);
    }

    return handleApiError(error);
  }
}
