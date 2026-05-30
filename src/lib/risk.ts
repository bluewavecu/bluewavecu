import type { Prisma, RiskSeverity } from "@/generated/prisma/client";
import { getUserKycStatus } from "@/lib/customerProfile";
import { sendAdminAlertEmail } from "@/lib/email";
import { createSecurityNotification } from "@/lib/notifications";
import { getPrisma } from "@/lib/prisma";

export type RiskAssessment = {
  score: number;
  severity: RiskSeverity;
  reason: string;
  eventType: string;
  metadata?: Record<string, unknown>;
};

const HIGH_AMOUNT_THRESHOLD = 5000;
const RAPID_TRANSFER_WINDOW_MS = 15 * 60 * 1000;
const RAPID_TRANSFER_COUNT = 3;

export function getRiskSeverity(score: number): RiskSeverity {
  if (score >= 90) {
    return "CRITICAL";
  }

  if (score >= 70) {
    return "HIGH";
  }

  if (score >= 40) {
    return "MEDIUM";
  }

  return "LOW";
}

function sanitizeMetadata(metadata?: Record<string, unknown>): Prisma.InputJsonValue | undefined {
  if (!metadata) {
    return undefined;
  }

  const safe: Record<string, string | number | boolean | null> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      safe[key] = value;
    }
  }

  return Object.keys(safe).length > 0 ? safe : undefined;
}

export async function createRiskEvent(params: {
  userId: string;
  eventType: string;
  riskScore: number;
  severity: RiskSeverity;
  reason: string;
  metadata?: Record<string, unknown>;
}) {
  return getPrisma().riskEvent.create({
    data: {
      userId: params.userId,
      eventType: params.eventType,
      riskScore: params.riskScore,
      severity: params.severity,
      reason: params.reason,
      metadata: sanitizeMetadata(params.metadata),
    },
  });
}

async function handleHighRisk(params: {
  userId: string;
  assessment: RiskAssessment;
}) {
  if (params.assessment.severity !== "HIGH" && params.assessment.severity !== "CRITICAL") {
    return;
  }

  void createSecurityNotification({
    userId: params.userId,
    title: "Security alert: elevated risk activity",
    message: params.assessment.reason,
    metadata: {
      eventType: params.assessment.eventType,
      severity: params.assessment.severity,
      href: "/security",
    },
  });

  void sendAdminAlertEmail({
    subject: `Risk alert (${params.assessment.severity})`,
    message: `${params.assessment.eventType}: ${params.assessment.reason}`,
    idempotencyKey: `admin-alert/risk/${params.userId}/${params.assessment.eventType}/${Date.now()}`,
  });
}

export async function recordRiskAssessment(params: {
  userId: string;
  assessment: RiskAssessment;
}) {
  const event = await createRiskEvent({
    userId: params.userId,
    eventType: params.assessment.eventType,
    riskScore: params.assessment.score,
    severity: params.assessment.severity,
    reason: params.assessment.reason,
    metadata: params.assessment.metadata,
  });

  if (params.assessment.severity === "HIGH" || params.assessment.severity === "CRITICAL") {
    await handleHighRisk(params);
  }

  return event;
}

export async function scoreLoginRisk(params: {
  userId: string;
  ipAddress: string;
  userAgent: string;
  loginFailed?: boolean;
}) {
  const prisma = getPrisma();
  let score = 10;
  const reasons: string[] = [];

  if (params.loginFailed) {
    score += 45;
    reasons.push("Repeated failed login attempt detected.");
  }

  const knownSession = await prisma.userSession.findFirst({
    where: {
      userId: params.userId,
      isActive: true,
      OR: [{ ipAddress: params.ipAddress }, { userAgent: params.userAgent }],
    },
    orderBy: { createdAt: "desc" },
  });

  if (!knownSession) {
    score += 35;
    reasons.push("Sign-in from an unfamiliar device or network.");
  }

  const recentFailedEvents = await prisma.riskEvent.count({
    where: {
      userId: params.userId,
      eventType: "LOGIN_FAILED",
      createdAt: {
        gte: new Date(Date.now() - 60 * 60 * 1000),
      },
    },
  });

  if (recentFailedEvents >= 2) {
    score += 25;
    reasons.push("Multiple failed login attempts in the last hour.");
  }

  const severity = getRiskSeverity(score);

  return {
    score,
    severity,
    reason: reasons.join(" ") || "Routine sign-in activity.",
    eventType: params.loginFailed ? "LOGIN_FAILED" : "LOGIN",
    metadata: {
      ipAddress: params.ipAddress,
      deviceKnown: Boolean(knownSession),
    },
  } satisfies RiskAssessment;
}

export async function scoreTransferRisk(params: {
  userId: string;
  amount: number;
  destinationAccountNumber?: string | null;
  isScheduled?: boolean;
}) {
  const prisma = getPrisma();
  let score = 15;
  const reasons: string[] = [];
  const kycStatus = await getUserKycStatus(params.userId);
  const kycVerified = kycStatus === "VERIFIED";

  if (!kycVerified) {
    score += 25;
    reasons.push("Member identity verification is not complete.");

    if (params.amount >= HIGH_AMOUNT_THRESHOLD) {
      score += 20;
      reasons.push("High-value transfer by an unverified member.");
    }
  }

  if (params.amount >= HIGH_AMOUNT_THRESHOLD) {
    score += 45;
    reasons.push(`Transfer amount exceeds $${HIGH_AMOUNT_THRESHOLD.toLocaleString()}.`);
  }

  if (params.destinationAccountNumber) {
    const priorTransfer = await prisma.transaction.findFirst({
      where: {
        userId: params.userId,
        type: "TRANSFER",
        destinationAccountNumber: params.destinationAccountNumber,
      },
    });

    const priorScheduled = await prisma.scheduledTransfer.findFirst({
      where: {
        userId: params.userId,
        destinationAccountNumber: params.destinationAccountNumber,
      },
    });

    if (!priorTransfer && !priorScheduled) {
      score += 25;
      reasons.push("Transfer to a new recipient account.");
    }
  }

  const recentTransfers = await prisma.transaction.count({
    where: {
      userId: params.userId,
      type: "TRANSFER",
      createdAt: {
        gte: new Date(Date.now() - RAPID_TRANSFER_WINDOW_MS),
      },
    },
  });

  if (recentTransfers >= RAPID_TRANSFER_COUNT) {
    score += 30;
    reasons.push("Multiple transfer requests submitted in a short window.");
  }

  if (params.isScheduled) {
    score += 5;
  }

  const severity = getRiskSeverity(score);
  const eventType =
    !kycVerified && params.amount >= HIGH_AMOUNT_THRESHOLD
      ? "KYC_UNVERIFIED_TRANSFER"
      : params.isScheduled
        ? "SCHEDULED_TRANSFER"
        : "TRANSFER";

  return {
    score,
    severity,
    reason: reasons.join(" ") || "Routine transfer activity.",
    eventType,
    metadata: {
      amount: params.amount,
      isScheduled: Boolean(params.isScheduled),
      kycStatus,
    },
  } satisfies RiskAssessment;
}

export async function scoreBillPaymentRisk(params: {
  userId: string;
  amount: number;
  payeeId: string;
}) {
  const prisma = getPrisma();
  let score = 20;
  const reasons: string[] = [];
  const kycStatus = await getUserKycStatus(params.userId);
  const kycVerified = kycStatus === "VERIFIED";

  if (!kycVerified) {
    score += 25;
    reasons.push("Member identity verification is not complete.");

    if (params.amount >= HIGH_AMOUNT_THRESHOLD) {
      score += 20;
      reasons.push("High-value bill payment by an unverified member.");
    }
  }

  if (params.amount >= HIGH_AMOUNT_THRESHOLD) {
    score += 40;
    reasons.push(`Bill payment amount exceeds $${HIGH_AMOUNT_THRESHOLD.toLocaleString()}.`);
  }

  const priorPayment = await prisma.billPayment.findFirst({
    where: {
      userId: params.userId,
      payeeId: params.payeeId,
      status: { in: ["POSTED", "PENDING_REVIEW", "APPROVED"] },
    },
  });

  if (!priorPayment) {
    score += 20;
    reasons.push("First bill payment to this payee.");
  }

  const recentPayments = await prisma.billPayment.count({
    where: {
      userId: params.userId,
      createdAt: { gte: new Date(Date.now() - RAPID_TRANSFER_WINDOW_MS) },
    },
  });

  if (recentPayments >= RAPID_TRANSFER_COUNT) {
    score += 25;
    reasons.push("Multiple bill payments submitted in a short window.");
  }

  const severity = getRiskSeverity(score);
  const eventType =
    !kycVerified && params.amount >= HIGH_AMOUNT_THRESHOLD
      ? "KYC_UNVERIFIED_BILL_PAYMENT"
      : "BILL_PAYMENT";

  return {
    score,
    severity,
    reason: reasons.join(" ") || "Routine bill payment activity.",
    eventType,
    metadata: { amount: params.amount, payeeId: params.payeeId, kycStatus },
  } satisfies RiskAssessment;
}

export async function scoreAdminReviewRisk(params: {
  userId: string;
  action: "FAILED" | "REVERSED";
  reference: string;
}) {
  const score = params.action === "REVERSED" ? 55 : 45;
  const severity = getRiskSeverity(score);

  return {
    score,
    severity,
    reason:
      params.action === "REVERSED"
        ? `Admin reversed transfer ${params.reference}.`
        : `Admin declined transfer ${params.reference}.`,
    eventType: "ADMIN_TRANSFER_REVIEW",
    metadata: {
      reference: params.reference,
      action: params.action,
    },
  } satisfies RiskAssessment;
}

export async function applyRiskAssessment(params: {
  userId: string;
  assessment: RiskAssessment;
}) {
  if (params.assessment.severity === "LOW") {
    return null;
  }

  return recordRiskAssessment(params);
}

export function shouldBlockAction(severity: RiskSeverity) {
  return severity === "CRITICAL";
}
