import { sendAdminAlertEmail, sendKycStatusEmail } from "@/lib/email";
import { writeAdminEvent, writeEventLog } from "@/lib/eventLog";
import { createNotification } from "@/lib/notifications";
import { getPrisma } from "@/lib/prisma";
import type { CustomerProfileRecord, KycStatus } from "@/types/banking";

export function serializeCustomerProfile(record: {
  id: string;
  userId: string;
  dateOfBirth: Date | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  employmentStatus: string | null;
  annualIncome: { toNumber: () => number } | null;
  kycStatus: KycStatus;
  kycSubmittedAt: Date | null;
  kycReviewedAt: Date | null;
  kycReviewedBy: string | null;
  kycReviewNote: string | null;
  profilePhotoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: { fullName: string; email: string; phone: string };
}): CustomerProfileRecord {
  return {
    id: record.id,
    userId: record.userId,
    dateOfBirth: record.dateOfBirth?.toISOString().slice(0, 10) ?? null,
    addressLine1: record.addressLine1,
    addressLine2: record.addressLine2,
    city: record.city,
    state: record.state,
    postalCode: record.postalCode,
    country: record.country,
    employmentStatus: record.employmentStatus,
    annualIncome: record.annualIncome?.toNumber() ?? null,
    kycStatus: record.kycStatus,
    kycSubmittedAt: record.kycSubmittedAt?.toISOString() ?? null,
    kycReviewedAt: record.kycReviewedAt?.toISOString() ?? null,
    kycReviewedBy: record.kycReviewedBy,
    kycReviewNote: record.kycReviewNote,
    profilePhotoUrl: record.profilePhotoUrl,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    userName: record.user?.fullName,
    userEmail: record.user?.email,
    userPhone: record.user?.phone,
  };
}

const profileInclude = {
  user: { select: { fullName: true, email: true, phone: true } },
} as const;

export async function getOrCreateCustomerProfile(userId: string) {
  const prisma = getPrisma();
  const existing = await prisma.customerProfile.findUnique({
    where: { userId },
    include: profileInclude,
  });

  if (existing) {
    return existing;
  }

  return prisma.customerProfile.create({
    data: { userId },
    include: profileInclude,
  });
}

export async function getUserKycStatus(userId: string): Promise<KycStatus> {
  const profile = await getPrisma().customerProfile.findUnique({
    where: { userId },
    select: { kycStatus: true },
  });

  return profile?.kycStatus ?? "NOT_STARTED";
}

function parseDateOfBirth(value: string) {
  const parsed = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date of birth");
  }

  return parsed;
}

export async function updateCustomerProfile(params: {
  userId: string;
  dateOfBirth?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  employmentStatus?: string;
  annualIncome?: number;
}) {
  await getOrCreateCustomerProfile(params.userId);

  const updated = await getPrisma().customerProfile.update({
    where: { userId: params.userId },
    data: {
      ...(params.dateOfBirth !== undefined
        ? { dateOfBirth: parseDateOfBirth(params.dateOfBirth) }
        : {}),
      ...(params.addressLine1 !== undefined ? { addressLine1: params.addressLine1 } : {}),
      ...(params.addressLine2 !== undefined ? { addressLine2: params.addressLine2 } : {}),
      ...(params.city !== undefined ? { city: params.city } : {}),
      ...(params.state !== undefined ? { state: params.state } : {}),
      ...(params.postalCode !== undefined ? { postalCode: params.postalCode } : {}),
      ...(params.country !== undefined ? { country: params.country } : {}),
      ...(params.employmentStatus !== undefined
        ? { employmentStatus: params.employmentStatus }
        : {}),
      ...(params.annualIncome !== undefined ? { annualIncome: params.annualIncome } : {}),
    },
    include: profileInclude,
  });

  return updated;
}

function validateProfileForKyc(profile: {
  dateOfBirth: Date | null;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  employmentStatus: string | null;
}) {
  const missing: string[] = [];

  if (!profile.dateOfBirth) missing.push("date of birth");
  if (!profile.addressLine1?.trim()) missing.push("address");
  if (!profile.city?.trim()) missing.push("city");
  if (!profile.state?.trim()) missing.push("state");
  if (!profile.postalCode?.trim()) missing.push("postal code");
  if (!profile.employmentStatus?.trim()) missing.push("employment status");

  if (missing.length > 0) {
    throw new Error(`Complete your profile before submitting KYC: ${missing.join(", ")}.`);
  }
}

export async function submitCustomerKyc(userId: string) {
  const profile = await getOrCreateCustomerProfile(userId);

  if (profile.kycStatus === "VERIFIED") {
    throw new Error("Your identity is already verified.");
  }

  if (profile.kycStatus === "SUBMITTED" || profile.kycStatus === "UNDER_REVIEW") {
    throw new Error("Your KYC submission is already under review.");
  }

  validateProfileForKyc(profile);

  const updated = await getPrisma().customerProfile.update({
    where: { userId },
    data: {
      kycStatus: "SUBMITTED",
      kycSubmittedAt: new Date(),
      kycReviewedAt: null,
      kycReviewedBy: null,
      kycReviewNote: null,
    },
    include: profileInclude,
  });

  void writeEventLog({
    eventType: "KYC_SUBMITTED",
    actorId: userId,
    entityType: "CustomerProfile",
    entityId: updated.id,
    message: "Member submitted KYC profile for review.",
    severity: "INFO",
  });

  void createNotification({
    userId,
    type: "ACCOUNT",
    title: "KYC submitted",
    message: "Your profile was submitted for identity verification review.",
    metadata: { href: "/auth/profile", kycStatus: "SUBMITTED" },
  });

  void sendAdminAlertEmail({
    subject: "KYC submission received",
    message: `${updated.user.fullName} submitted a KYC profile for review.`,
    idempotencyKey: `admin-alert/kyc-submitted/${updated.id}`,
  });

  return updated;
}

export async function updateCustomerKycStatus(params: {
  profileId: string;
  status: Extract<KycStatus, "UNDER_REVIEW" | "VERIFIED" | "REJECTED">;
  reviewNote?: string;
  adminId: string;
}) {
  const prisma = getPrisma();
  const profile = await prisma.customerProfile.findUnique({
    where: { id: params.profileId },
    include: profileInclude,
  });

  if (!profile) {
    throw new Error("Customer profile not found");
  }

  if (params.status === "REJECTED" && !params.reviewNote?.trim()) {
    throw new Error("Review note is required when rejecting KYC.");
  }

  const updated = await prisma.customerProfile.update({
    where: { id: params.profileId },
    data: {
      kycStatus: params.status,
      kycReviewedAt: new Date(),
      kycReviewedBy: params.adminId,
      kycReviewNote: params.reviewNote?.trim() ?? null,
    },
    include: profileInclude,
  });

  void writeAdminEvent({
    eventType: "KYC_STATUS_UPDATED",
    actorId: params.adminId,
    entityId: updated.id,
    message: `KYC status updated to ${params.status}.`,
    metadata: {
      entityType: "CustomerProfile",
      userId: updated.userId,
      status: params.status,
      reviewNote: params.reviewNote ?? null,
    },
  });

  void writeEventLog({
    eventType: "KYC_STATUS_UPDATED",
    actorId: params.adminId,
    entityType: "CustomerProfile",
    entityId: updated.id,
    message: `KYC review completed with status ${params.status}.`,
    severity: params.status === "REJECTED" ? "WARNING" : "INFO",
    metadata: {
      userId: updated.userId,
      status: params.status,
    },
  });

  const statusLabel = params.status.replaceAll("_", " ").toLowerCase();

  void createNotification({
    userId: updated.userId,
    type: "ACCOUNT",
    title: `KYC ${statusLabel}`,
    message:
      params.status === "REJECTED" && params.reviewNote
        ? `Your KYC review was rejected: ${params.reviewNote}`
        : `Your KYC status is now ${statusLabel}.`,
    metadata: { href: "/auth/profile", kycStatus: params.status },
  });

  void sendKycStatusEmail({
    email: updated.user.email,
    fullName: updated.user.fullName,
    status: params.status,
    reviewNote: params.reviewNote,
  });

  return updated;
}
