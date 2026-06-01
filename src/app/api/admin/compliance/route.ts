import { NextRequest } from "next/server";
import { logAdminAction, requireAdmin } from "@/lib/admin";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { serializeCustomerProfile, updateCustomerKycStatus } from "@/lib/customerProfile";
import { serializeIdVerificationSubmission } from "@/lib/idVerification";
import { getPrisma } from "@/lib/prisma";
import { adminKycUpdateSchema } from "@/lib/validators";
import type { AdminComplianceData, KycStatus } from "@/types/banking";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? "NEEDS_REVIEW";

    const where: { kycStatus?: KycStatus | { in: KycStatus[] } } = {};

    if (status === "NEEDS_REVIEW") {
      where.kycStatus = { in: ["NOT_STARTED", "SUBMITTED", "UNDER_REVIEW"] };
    } else if (status !== "ALL") {
      where.kycStatus = status as KycStatus;
    }

    const [profiles, notStarted, submitted, underReview, verified, rejected, total] =
      await Promise.all([
        getPrisma().customerProfile.findMany({
          where,
          include: {
            user: { select: { fullName: true, email: true, phone: true } },
          },
          orderBy: { updatedAt: "desc" },
          take: 100,
        }),
        getPrisma().customerProfile.count({ where: { kycStatus: "NOT_STARTED" } }),
        getPrisma().customerProfile.count({ where: { kycStatus: "SUBMITTED" } }),
        getPrisma().customerProfile.count({ where: { kycStatus: "UNDER_REVIEW" } }),
        getPrisma().customerProfile.count({ where: { kycStatus: "VERIFIED" } }),
        getPrisma().customerProfile.count({ where: { kycStatus: "REJECTED" } }),
        getPrisma().customerProfile.count(),
      ]);

    const userIds = profiles.map((profile) => profile.userId);
    const latestIdVerifications =
      userIds.length === 0
        ? []
        : await getPrisma().idVerificationSubmission.findMany({
            where: { userId: { in: userIds } },
            orderBy: { submittedAt: "desc" },
            distinct: ["userId"],
          });

    const idVerificationByUserId = new Map(
      latestIdVerifications.map((submission) => [
        submission.userId,
        serializeIdVerificationSubmission(submission),
      ]),
    );

    const data: AdminComplianceData = {
      profiles: profiles.map((profile) => ({
        ...serializeCustomerProfile(profile),
        latestIdVerification: idVerificationByUserId.get(profile.userId) ?? null,
      })),
      summary: {
        notStarted,
        submitted,
        underReview,
        verified,
        rejected,
        total,
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

    const input = adminKycUpdateSchema.parse(await request.json());

    const profile = await updateCustomerKycStatus({
      profileId: input.profileId,
      status: input.status,
      reviewNote: input.reviewNote,
      adminId: auth.admin.id,
    });

    await logAdminAction({
      adminId: auth.admin.id,
      action: "UPDATE_KYC_STATUS",
      entityType: "CustomerProfile",
      entityId: input.profileId,
      details: {
        status: input.status,
        reviewNote: input.reviewNote ?? null,
      },
    });

    return apiSuccess({ profile: serializeCustomerProfile(profile) });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Customer profile not found") {
        return apiError(error.message, 404);
      }

      if (error.message.includes("Review note is required")) {
        return apiError(error.message, 400);
      }
    }

    return handleApiError(error);
  }
}
