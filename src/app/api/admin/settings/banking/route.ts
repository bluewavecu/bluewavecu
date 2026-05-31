import { NextRequest } from "next/server";
import { logAdminAction, requireAdmin } from "@/lib/admin";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { getBankingPolicy, updateBankingPolicy } from "@/lib/bankingPolicy";
import { writeAdminEvent } from "@/lib/eventLog";
import { adminUpdateBankingPolicySchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const policy = await getBankingPolicy();
    return apiSuccess({ policy });
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

    const input = adminUpdateBankingPolicySchema.parse(await request.json());

    if (
      input.requireTransactionOtp === undefined &&
      input.requireTransferReview === undefined
    ) {
      return apiError("No banking policy changes were provided.", 400);
    }

    const policy = await updateBankingPolicy({
      requireTransactionOtp: input.requireTransactionOtp,
      requireTransferReview: input.requireTransferReview,
      updatedBy: auth.admin.id,
    });

    await logAdminAction({
      adminId: auth.admin.id,
      action: "UPDATE_BANKING_POLICY",
      entityType: "BankingPolicy",
      entityId: "default",
      details: policy,
    });

    void writeAdminEvent({
      eventType: "BANKING_POLICY_UPDATED",
      actorId: auth.admin.id,
      entityId: "default",
      message: "Banking policy controls updated.",
      metadata: policy,
    });

    return apiSuccess({ policy });
  } catch (error) {
    return handleApiError(error);
  }
}
