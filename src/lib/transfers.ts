import { randomUUID } from "crypto";
import { maskAccountNumber } from "@/lib/bankingSerialize";
import {
  getBankingPolicy,
  userRequiresTransactionOtp,
  userRequiresTransferReview,
} from "@/lib/bankingPolicy";
import {
  sendAdminAlertEmail,
  sendTransactionApprovedEmail,
  sendTransactionPendingEmail,
  sendTransactionSuccessfulEmail,
} from "@/lib/email";
import { writeLedgerEvent } from "@/lib/eventLog";
import { postApprovedTransferTransaction } from "@/lib/ledger";
import { createTransferNotification } from "@/lib/notifications";
import { getPrisma } from "@/lib/prisma";
import { applyRiskAssessment, scoreTransferRisk, shouldBlockAction } from "@/lib/risk";
import { verifyTransferOtpChallenge, verifyTransactionPin } from "@/lib/transactionOtp";
import { verifyMemberTransferOtpCodesForUser } from "@/lib/memberTransferOtpSteps";
import { canUserTransact, getTransactionBlockMessage } from "@/lib/userAccess";
import type { TransferInput } from "@/lib/validators";
import type { PageTransaction } from "@/types/banking";

export class TransferRequestError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "TransferRequestError";
    this.status = status;
  }
}

function buildTransferDescription(input: {
  recipientName?: string;
  toAccountNumber?: string;
  memo?: string;
}) {
  const recipientLabel = input.recipientName
    ? input.recipientName
    : input.toAccountNumber
      ? `Account ending ${input.toAccountNumber.slice(-4)}`
      : "External recipient";

  if (input.memo) {
    return `Transfer to ${recipientLabel}: ${input.memo}`;
  }

  return `Transfer to ${recipientLabel}`;
}

export async function submitMemberTransfer(params: {
  userId: string;
  input: TransferInput;
  otpCode?: string;
  transactionPin?: string;
  stepOtpCodes?: TransferInput["stepOtpCodes"];
}) {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
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
    throw new TransferRequestError("User not found", 404);
  }

  const transactionBlockMessage = getTransactionBlockMessage({
    status: user.status,
    deletedAt: user.deletedAt,
  });

  if (transactionBlockMessage) {
    throw new TransferRequestError(transactionBlockMessage, 403);
  }

  if (!canUserTransact({ status: user.status, deletedAt: user.deletedAt })) {
    throw new TransferRequestError("Your account cannot initiate transactions.", 403);
  }

  const policy = await getBankingPolicy();
  const requiresOtp = userRequiresTransactionOtp({
    transactionsUnrestricted: user.transactionsUnrestricted,
    policy,
  });
  const requiresReview = userRequiresTransferReview({
    transactionsUnrestricted: user.transactionsUnrestricted,
    policy,
  });

  if (requiresOtp) {
    if (!params.otpCode) {
      throw new TransferRequestError("Email verification code is required.", 400);
    }

    const otpResult = await verifyTransferOtpChallenge({
      userId: params.userId,
      otpCode: params.otpCode,
      payload: params.input,
    });

    if (!otpResult.ok) {
      throw new TransferRequestError(otpResult.message, 400);
    }
  }

  const adminStepVerification = await verifyMemberTransferOtpCodesForUser({
    userId: params.userId,
    stepOtpCodes: params.stepOtpCodes ?? params.input.stepOtpCodes,
  });

  if (!adminStepVerification.ok) {
    throw new TransferRequestError(adminStepVerification.message, 400);
  }

  const pinMatches = await verifyTransactionPin(
    params.transactionPin ?? "",
    user.transactionPinHash,
  );

  if (!pinMatches) {
    throw new TransferRequestError("Transaction PIN is incorrect.", 400);
  }

  if (user.transactionPinHash && !params.transactionPin) {
    throw new TransferRequestError("Transaction PIN is required.", 400);
  }

  const account = await prisma.account.findFirst({
    where: {
      id: params.input.fromAccountId,
      userId: params.userId,
    },
    select: {
      id: true,
      accountType: true,
      accountNumber: true,
    },
  });

  if (!account) {
    throw new TransferRequestError("Account not found", 404);
  }

  const description = buildTransferDescription(params.input);
  const merchant = params.input.recipientName ?? "External transfer";

  const assessment = await scoreTransferRisk({
    userId: params.userId,
    amount: params.input.amount,
    destinationAccountNumber: params.input.toAccountNumber,
  });

  if (shouldBlockAction(assessment.severity)) {
    await applyRiskAssessment({ userId: params.userId, assessment });
    throw new TransferRequestError("Transfer blocked due to critical risk review.", 403);
  }

  void applyRiskAssessment({ userId: params.userId, assessment });

  const transaction = await prisma.transaction.create({
    data: {
      userId: params.userId,
      accountId: account.id,
      type: "TRANSFER",
      amount: -Math.abs(params.input.amount),
      description,
      merchant,
      reference: `TRF-${randomUUID()}`,
      status: "PENDING",
      destinationAccountNumber: params.input.toAccountNumber?.trim() || null,
    },
  });

  const masked = maskAccountNumber(account.accountNumber);
  let finalStatus = transaction.status;
  let message = "Transfer request created and pending review.";

  if (!requiresReview) {
    const posted = await postApprovedTransferTransaction({
      transactionId: transaction.id,
      adminId: params.userId,
      reviewNote: "Auto-approved trusted member transfer.",
    });

    finalStatus = posted.status;
    message = "Transfer completed successfully.";

    void sendTransactionSuccessfulEmail({
      email: user.email,
      fullName: user.fullName,
      amount: posted.amount,
      reference: posted.reference,
      description: posted.description,
    });

    void createTransferNotification({
      userId: params.userId,
      event: "approved",
      reference: posted.reference,
      amount: posted.amount,
      metadata: { href: "/auth/transactions" },
    });

    void writeLedgerEvent({
      eventType: "TRANSFER_POSTED",
      actorId: params.userId,
      entityId: posted.id,
      message: `Trusted member transfer ${posted.reference} auto-approved.`,
      metadata: { reference: posted.reference, amount: Math.abs(params.input.amount) },
    });
  } else {
    void sendTransactionPendingEmail({
      email: user.email,
      fullName: user.fullName,
      amount: transaction.amount.toNumber(),
      reference: transaction.reference,
      description: transaction.description,
    });

    void sendAdminAlertEmail({
      subject: "Pending transfer review",
      message: `${user.fullName} submitted transfer ${transaction.reference} for $${Math.abs(transaction.amount.toNumber()).toFixed(2)}.`,
      idempotencyKey: `admin-alert/transfer-created/${transaction.reference}`,
    });

    void createTransferNotification({
      userId: params.userId,
      event: "created",
      reference: transaction.reference,
      amount: transaction.amount.toNumber(),
      metadata: { href: "/auth/transfers" },
    });

    void writeLedgerEvent({
      eventType: "TRANSFER_CREATED",
      actorId: params.userId,
      entityId: transaction.id,
      message: `Transfer ${transaction.reference} created for review.`,
      metadata: { reference: transaction.reference, amount: Math.abs(params.input.amount) },
    });
  }

  const serializedTransaction: PageTransaction = {
    id: transaction.id,
    accountId: transaction.accountId,
    accountType: account.accountType,
    maskedAccountNumber: masked.masked,
    type: transaction.type,
    amount: transaction.amount.toNumber(),
    description: transaction.description,
    merchant: transaction.merchant,
    reference: transaction.reference,
    status: finalStatus,
    createdAt: transaction.createdAt.toISOString(),
  };

  return {
    transaction: serializedTransaction,
    message,
    autoApproved: !requiresReview,
  };
}
