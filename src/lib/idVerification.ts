import { randomUUID } from "node:crypto";
import { getOrCreateCustomerProfile } from "@/lib/customerProfile";
import { saveIdDocumentPhoto } from "@/lib/idDocumentStorage";
import { documentTypeRequiresBackPhoto, idDocumentTypeLabels } from "@/lib/idVerificationShared";
import { sendAdminAlertEmail, sendIdVerificationReviewEmail } from "@/lib/email";
import { writeAdminEvent, writeEventLog } from "@/lib/eventLog";
import { createNotification } from "@/lib/notifications";
import { getPrisma } from "@/lib/prisma";
import type {
  IdDocumentType,
  IdVerificationRecord,
  IdVerificationStatus,
} from "@/types/banking";

const submissionInclude = {
  user: {
    select: {
      fullName: true,
      email: true,
      phone: true,
    },
  },
} as const;

export function serializeIdVerificationSubmission(record: {
  id: string;
  userId: string;
  documentType: IdDocumentType;
  frontPhotoUrl: string;
  backPhotoUrl: string | null;
  status: IdVerificationStatus;
  reviewNote: string | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    fullName: string;
    email: string;
    phone?: string;
  };
}): IdVerificationRecord {
  return {
    id: record.id,
    userId: record.userId,
    documentType: record.documentType,
    documentTypeLabel: idDocumentTypeLabels[record.documentType] ?? record.documentType,
    frontPhotoUrl: record.frontPhotoUrl,
    backPhotoUrl: record.backPhotoUrl,
    status: record.status,
    reviewNote: record.reviewNote,
    reviewedAt: record.reviewedAt?.toISOString() ?? null,
    reviewedBy: record.reviewedBy,
    submittedAt: record.submittedAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    userName: record.user?.fullName,
    userEmail: record.user?.email,
    userPhone: record.user?.phone,
  };
}

export async function getMemberIdVerificationData(userId: string) {
  const prisma = getPrisma();

  const [submissions, pendingCount] = await Promise.all([
    prisma.idVerificationSubmission.findMany({
      where: { userId },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.idVerificationSubmission.count({
      where: { userId, status: "PENDING" },
    }),
  ]);

  const latestSubmission = submissions[0] ?? null;
  const canSubmit =
    pendingCount === 0 &&
    (latestSubmission === null ||
      latestSubmission.status === "REJECTED" ||
      latestSubmission.status === "DECLINED");

  return {
    submissions: submissions.map(serializeIdVerificationSubmission),
    canSubmit,
    pendingCount,
    latestStatus: latestSubmission?.status ?? null,
  };
}

export async function submitIdVerification(params: {
  userId: string;
  documentType: IdDocumentType;
  frontPhoto: File;
  backPhoto?: File | null;
}) {
  if (documentTypeRequiresBackPhoto(params.documentType) && !params.backPhoto) {
    throw new Error("Upload both the front and back of your ID.");
  }

  const prisma = getPrisma();
  const pending = await prisma.idVerificationSubmission.count({
    where: { userId: params.userId, status: "PENDING" },
  });

  if (pending > 0) {
    throw new Error("Your ID submission is already waiting for review.");
  }

  const latestApproved = await prisma.idVerificationSubmission.findFirst({
    where: { userId: params.userId, status: "APPROVED" },
    orderBy: { reviewedAt: "desc" },
  });

  if (latestApproved) {
    throw new Error("Your ID is already verified.");
  }

  const submissionId = randomUUID();
  const frontPhotoUrl = await saveIdDocumentPhoto({
    userId: params.userId,
    submissionId,
    side: "front",
    file: params.frontPhoto,
  });

  let backPhotoUrl: string | null = null;

  if (params.backPhoto) {
    backPhotoUrl = await saveIdDocumentPhoto({
      userId: params.userId,
      submissionId,
      side: "back",
      file: params.backPhoto,
    });
  }

  const submission = await prisma.idVerificationSubmission.create({
    data: {
      id: submissionId,
      userId: params.userId,
      documentType: params.documentType,
      frontPhotoUrl,
      backPhotoUrl,
      status: "PENDING",
    },
    include: submissionInclude,
  });

  const profile = await getOrCreateCustomerProfile(params.userId);

  if (profile.kycStatus === "NOT_STARTED" || profile.kycStatus === "REJECTED") {
    await prisma.customerProfile.update({
      where: { userId: params.userId },
      data: {
        kycStatus: "SUBMITTED",
        kycSubmittedAt: new Date(),
        kycReviewedAt: null,
        kycReviewedBy: null,
        kycReviewNote: null,
      },
    });
  } else if (profile.kycStatus !== "VERIFIED") {
    await prisma.customerProfile.update({
      where: { userId: params.userId },
      data: {
        kycStatus: "UNDER_REVIEW",
      },
    });
  }

  void writeEventLog({
    eventType: "ID_VERIFICATION_SUBMITTED",
    actorId: params.userId,
    entityType: "IdVerificationSubmission",
    entityId: submission.id,
    message: "Member submitted ID photos for verification.",
    severity: "INFO",
  });

  void createNotification({
    userId: params.userId,
    type: "ACCOUNT",
    title: "ID submitted for review",
    message: "Your ID photos were sent to member services for verification.",
    metadata: { href: "/auth/profile", idVerificationStatus: "PENDING" },
  });

  void sendAdminAlertEmail({
    subject: "ID verification submitted",
    message: `${submission.user.fullName} submitted ${submission.documentType.replaceAll("_", " ").toLowerCase()} photos for review.`,
    idempotencyKey: `admin-alert/id-verification/${submission.id}`,
  });

  return serializeIdVerificationSubmission(submission);
}

async function syncProfileAfterReview(params: {
  userId: string;
  adminId: string;
  status: Extract<IdVerificationStatus, "APPROVED" | "REJECTED" | "DECLINED">;
  reviewNote?: string;
}) {
  const prisma = getPrisma();
  const kycStatus =
    params.status === "APPROVED"
      ? "VERIFIED"
      : "REJECTED";

  await prisma.customerProfile.upsert({
    where: { userId: params.userId },
    update: {
      kycStatus,
      kycReviewedAt: new Date(),
      kycReviewedBy: params.adminId,
      kycReviewNote: params.reviewNote?.trim() ?? null,
    },
    create: {
      userId: params.userId,
      kycStatus,
      kycReviewedAt: new Date(),
      kycReviewedBy: params.adminId,
      kycReviewNote: params.reviewNote?.trim() ?? null,
    },
  });
}

export async function reviewIdVerificationSubmission(params: {
  submissionId: string;
  adminId: string;
  action: "APPROVE" | "REJECT" | "DECLINE";
  reviewNote?: string;
}) {
  if (params.action !== "APPROVE" && !params.reviewNote?.trim()) {
    throw new Error("Review note is required when rejecting or declining ID verification.");
  }

  const prisma = getPrisma();
  const submission = await prisma.idVerificationSubmission.findUnique({
    where: { id: params.submissionId },
    include: submissionInclude,
  });

  if (!submission) {
    throw new Error("ID verification submission not found.");
  }

  if (submission.status !== "PENDING") {
    throw new Error("Only pending ID submissions can be reviewed.");
  }

  const nextStatus: IdVerificationStatus =
    params.action === "APPROVE"
      ? "APPROVED"
      : params.action === "REJECT"
        ? "REJECTED"
        : "DECLINED";

  const updated = await prisma.idVerificationSubmission.update({
    where: { id: params.submissionId },
    data: {
      status: nextStatus,
      reviewNote: params.reviewNote?.trim() ?? null,
      reviewedAt: new Date(),
      reviewedBy: params.adminId,
    },
    include: submissionInclude,
  });

  await syncProfileAfterReview({
    userId: updated.userId,
    adminId: params.adminId,
    status: nextStatus,
    reviewNote: params.reviewNote,
  });

  void writeAdminEvent({
    eventType: "ID_VERIFICATION_REVIEWED",
    actorId: params.adminId,
    entityId: updated.id,
    message: `ID verification marked ${nextStatus}.`,
    metadata: {
      entityType: "IdVerificationSubmission",
      userId: updated.userId,
      status: nextStatus,
      reviewNote: params.reviewNote ?? null,
    },
  });

  void writeEventLog({
    eventType: "ID_VERIFICATION_REVIEWED",
    actorId: params.adminId,
    entityType: "IdVerificationSubmission",
    entityId: updated.id,
    message: `ID verification review completed with status ${nextStatus}.`,
    severity: nextStatus === "APPROVED" ? "INFO" : "WARNING",
    metadata: {
      userId: updated.userId,
      status: nextStatus,
    },
  });

  const actionLabel =
    nextStatus === "APPROVED"
      ? "approved"
      : nextStatus === "REJECTED"
        ? "rejected"
        : "declined";

  void createNotification({
    userId: updated.userId,
    type: "ACCOUNT",
    title: `ID verification ${actionLabel}`,
    message:
      params.reviewNote?.trim()
        ? `Your ID verification was ${actionLabel}: ${params.reviewNote.trim()}`
        : `Your ID verification was ${actionLabel}.`,
    metadata: { href: "/auth/profile", idVerificationStatus: nextStatus },
  });

  void sendIdVerificationReviewEmail({
    email: updated.user.email,
    fullName: updated.user.fullName,
    status: nextStatus,
    reviewNote: params.reviewNote,
  });

  return serializeIdVerificationSubmission(updated);
}
