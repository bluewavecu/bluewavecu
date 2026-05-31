import { NextRequest } from "next/server";
import { logAdminAction, requireAdmin } from "@/lib/admin";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { reviewIdVerificationSubmission, serializeIdVerificationSubmission } from "@/lib/idVerification";
import { getPrisma } from "@/lib/prisma";
import { adminReviewIdVerificationSchema } from "@/lib/validators";
import type { AdminIdVerificationRecord, AdminIdVerificationsData, IdVerificationStatus } from "@/types/banking";

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
        ? { status: status as IdVerificationStatus }
        : {};

    const prisma = getPrisma();
    const [submissions, pendingCount, approvedCount, rejectedCount, declinedCount, totalCount] =
      await Promise.all([
        prisma.idVerificationSubmission.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: { submittedAt: "desc" },
          take: 100,
        }),
        prisma.idVerificationSubmission.count({ where: { status: "PENDING" } }),
        prisma.idVerificationSubmission.count({ where: { status: "APPROVED" } }),
        prisma.idVerificationSubmission.count({ where: { status: "REJECTED" } }),
        prisma.idVerificationSubmission.count({ where: { status: "DECLINED" } }),
        prisma.idVerificationSubmission.count(),
      ]);

    const serialized: AdminIdVerificationRecord[] = submissions.map((submission) => ({
      ...serializeIdVerificationSubmission(submission),
      user: submission.user,
    }));

    const data: AdminIdVerificationsData = {
      submissions: serialized,
      summary: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        declined: declinedCount,
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

    const input = adminReviewIdVerificationSchema.parse(await request.json());

    const submission = await reviewIdVerificationSubmission({
      submissionId: input.submissionId,
      adminId: auth.admin.id,
      action: input.action,
      reviewNote: input.reviewNote,
    });

    const actionMap = {
      APPROVE: "ID_VERIFICATION_APPROVED",
      REJECT: "ID_VERIFICATION_REJECTED",
      DECLINE: "ID_VERIFICATION_DECLINED",
    } as const;

    void logAdminAction({
      adminId: auth.admin.id,
      action: actionMap[input.action],
      entityType: "IdVerificationSubmission",
      entityId: input.submissionId,
      details: {
        reviewNote: input.reviewNote ?? null,
      },
    });

    return apiSuccess({ submission });
  } catch (error) {
    if (error instanceof Error && error.message) {
      return apiError(error.message, 400);
    }

    return handleApiError(error);
  }
}
