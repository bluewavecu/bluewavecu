import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveRequestAuth } from "@/lib/requestAuth";

import {
  getBankingPolicy,
  userRequiresTransactionOtp,
} from "@/lib/bankingPolicy";
import { sendTransactionOtpEmail } from "@/lib/email";
import { getPrisma } from "@/lib/prisma";
import { enforceRateLimit, rateLimitPresets } from "@/lib/rateLimit";
import { createTransferOtpChallenge } from "@/lib/transactionOtp";
import { getEnabledMemberTransferOtpRequirements } from "@/lib/memberTransferOtpSteps";
import { canUserTransact, getTransactionBlockMessage } from "@/lib/userAccess";
import { transferOtpRequestSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const rateLimit = enforceRateLimit(request, "transfer-otp", rateLimitPresets.transfer);

    if (!rateLimit.allowed) {
      return apiError(rateLimit.message, 429);
    }

    const input = transferOtpRequestSchema.parse(await request.json());
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        status: true,
        deletedAt: true,
        transactionsUnrestricted: true,
        transactionPinHash: true,
      },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    const transactionBlockMessage = getTransactionBlockMessage({
      status: user.status,
      deletedAt: user.deletedAt,
    });

    if (transactionBlockMessage) {
      return apiError(transactionBlockMessage, 403);
    }

    if (!canUserTransact({ status: user.status, deletedAt: user.deletedAt })) {
      return apiError("Your account cannot initiate transactions.", 403);
    }

    if (input.transferMethod === "ACH") {
      return apiError("ACH is not functional for now. Please try again later.", 503);
    }

    const policy = await getBankingPolicy();
    const requiresOtp = userRequiresTransactionOtp({
      transactionsUnrestricted: user.transactionsUnrestricted,
      policy,
    });
    const adminSteps = await getEnabledMemberTransferOtpRequirements(payload.userId);
    const adminStepsRequired = adminSteps.length > 0;

    if (!requiresOtp && !adminStepsRequired) {
      return apiSuccess({
        message: "Verification code not required for this account.",
        expiresAt: new Date().toISOString(),
        requiresTransactionPin: Boolean(user.transactionPinHash),
        otpRequired: false,
        adminSteps: [],
        adminStepsRequired: false,
      });
    }

    let message = "Verification codes are ready.";
    let expiresAt = new Date().toISOString();
    let otpRequired = false;

    if (requiresOtp) {
      const challenge = await createTransferOtpChallenge({
        userId: payload.userId,
        payload: input,
      });

      void sendTransactionOtpEmail({
        email: user.email,
        fullName: user.fullName,
        code: challenge.code,
        amount: input.amount,
      });

      message = "Verification code sent to your email.";
      expiresAt = challenge.expiresAt.toISOString();
      otpRequired = true;
    } else if (adminStepsRequired) {
      message = "Enter the verification codes provided by member services.";
    }

    return apiSuccess({
      message,
      expiresAt,
      requiresTransactionPin: Boolean(user.transactionPinHash),
      otpRequired,
      adminSteps,
      adminStepsRequired,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
