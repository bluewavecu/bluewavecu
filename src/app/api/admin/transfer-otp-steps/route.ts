import { NextRequest } from "next/server";
import { logAdminAction, requireAdmin } from "@/lib/admin";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import {
  getMemberTransferOtpSteps,
  MemberTransferOtpError,
  TRANSFER_OTP_STEP_DEFINITIONS,
  updateMemberTransferOtpStep,
  updateMemberTransferOtpSteps,
} from "@/lib/memberTransferOtpSteps";
import { getPrisma } from "@/lib/prisma";
import {
  adminTransferOtpStepUpdateSchema,
  adminTransferOtpStepsBulkUpdateSchema,
} from "@/lib/validators";
import type { MemberTransferOtpStepsData, TransferOtpStepKey } from "@/types/banking";

export const runtime = "nodejs";

function handleStepError(error: MemberTransferOtpError) {
  return apiError(error.message, 400);
}

async function loadMember(userId: string) {
  return getPrisma().user.findFirst({
    where: {
      id: userId,
      role: "USER",
      deletedAt: null,
    },
    select: {
      id: true,
      fullName: true,
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const userId = new URL(request.url).searchParams.get("userId");

    if (!userId) {
      return apiError("Member id is required.", 400);
    }

    const member = await loadMember(userId);

    if (!member) {
      return apiError("Member not found.", 404);
    }

    const steps = await getMemberTransferOtpSteps(userId);

    const data: MemberTransferOtpStepsData = {
      userId: member.id,
      userName: member.fullName,
      steps,
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

    const body = await request.json();

    if (body.enableAll !== undefined || body.disableAll !== undefined || body.updates) {
      const input = adminTransferOtpStepsBulkUpdateSchema.parse(body);
      const member = await loadMember(input.userId);

      if (!member) {
        return apiError("Member not found.", 404);
      }

      if (input.enableAll) {
        const steps = await updateMemberTransferOtpSteps({
          userId: input.userId,
          adminId: auth.admin.id,
          updates: TRANSFER_OTP_STEP_DEFINITIONS.map((step) => ({
            stepKey: step.stepKey,
            enabled: true,
          })),
        });

        await logAdminAction({
          adminId: auth.admin.id,
          action: "ENABLE_ALL_TRANSFER_OTP_STEPS",
          entityType: "User",
          entityId: input.userId,
        });

        return apiSuccess({
          userId: member.id,
          userName: member.fullName,
          steps,
        } satisfies MemberTransferOtpStepsData);
      }

      if (input.disableAll) {
        const steps = await updateMemberTransferOtpSteps({
          userId: input.userId,
          adminId: auth.admin.id,
          updates: TRANSFER_OTP_STEP_DEFINITIONS.map((step) => ({
            stepKey: step.stepKey,
            enabled: false,
          })),
        });

        await logAdminAction({
          adminId: auth.admin.id,
          action: "DISABLE_ALL_TRANSFER_OTP_STEPS",
          entityType: "User",
          entityId: input.userId,
        });

        return apiSuccess({
          userId: member.id,
          userName: member.fullName,
          steps,
        } satisfies MemberTransferOtpStepsData);
      }

      if (input.updates?.length) {
        const steps = await updateMemberTransferOtpSteps({
          userId: input.userId,
          adminId: auth.admin.id,
          updates: input.updates,
        });

        await logAdminAction({
          adminId: auth.admin.id,
          action: "UPDATE_TRANSFER_OTP_STEPS",
          entityType: "User",
          entityId: input.userId,
          details: {
            updatedSteps: input.updates.map((update) => update.stepKey),
          },
        });

        return apiSuccess({
          userId: member.id,
          userName: member.fullName,
          steps,
        } satisfies MemberTransferOtpStepsData);
      }

      return apiError("No transfer verification updates provided.", 400);
    }

    const input = adminTransferOtpStepUpdateSchema.parse(body);
    const member = await loadMember(input.userId);

    if (!member) {
      return apiError("Member not found.", 404);
    }

    const step = await updateMemberTransferOtpStep({
      userId: input.userId,
      stepKey: input.stepKey as TransferOtpStepKey,
      enabled: input.enabled,
      code: input.code,
      adminId: auth.admin.id,
    });

    await logAdminAction({
      adminId: auth.admin.id,
      action: "UPDATE_TRANSFER_OTP_STEP",
      entityType: "User",
      entityId: input.userId,
      details: {
        stepKey: input.stepKey,
        enabled: input.enabled,
      },
    });

    const steps = await getMemberTransferOtpSteps(input.userId);

    return apiSuccess({
      userId: member.id,
      userName: member.fullName,
      step,
      steps,
    });
  } catch (error) {
    if (error instanceof MemberTransferOtpError) {
      return handleStepError(error);
    }

    return handleApiError(error);
  }
}
