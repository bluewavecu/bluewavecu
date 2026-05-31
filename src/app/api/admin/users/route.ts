import { NextRequest } from "next/server";
import { logAdminAction, requireAdmin } from "@/lib/admin";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { hashPassword } from "@/lib/auth";
import { createMemberUser } from "@/lib/createMemberUser";
import { createEmailVerificationOtpChallenge } from "@/lib/emailVerificationOtp";
import {
  sendAccountStatusEmail,
  sendEmailVerificationOtpEmail,
  sendTransactionPinEmail,
  sendWelcomeEmail,
} from "@/lib/email";
import { writeAdminEvent } from "@/lib/eventLog";
import { describeRequestedAccounts, provisionMembershipAccounts } from "@/lib/memberAccounts";
import { createAccountNotification } from "@/lib/notifications";
import { getPrisma } from "@/lib/prisma";
import { purgeMemberUser, PurgeMemberUserError } from "@/lib/purgeMemberUser";
import { revokeAllUserSessions } from "@/lib/sessions";
import {
  clearUserTransactionPin,
  generateSixDigitCode,
  setUserTransactionPin,
} from "@/lib/transactionOtp";
import { findUserByUsername } from "@/lib/username";
import { shouldRevokeSessionsOnStatusChange } from "@/lib/userAccess";
import { adminCreateMemberSchema, adminUpdateUserStatusSchema } from "@/lib/validators";
import type { AdminUserSummaryWithKyc, KycStatus, UserRole, UserStatus } from "@/types/banking";

export const runtime = "nodejs";

function serializeUser(user: {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  transactionsUnrestricted: boolean;
  transactionPinHash: string | null;
  statusNote: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  customerProfile?: { kycStatus: KycStatus } | null;
}): AdminUserSummaryWithKyc {
  return {
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    transactionsUnrestricted: user.transactionsUnrestricted,
    hasTransactionPin: Boolean(user.transactionPinHash),
    statusNote: user.statusNote,
    deletedAt: user.deletedAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    kycStatus: user.customerProfile?.kycStatus ?? null,
  };
}

function formatMemberAddress(input: {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}) {
  return [
    input.addressLine1,
    input.addressLine2,
    `${input.city}, ${input.state} ${input.postalCode}`,
    input.country,
  ]
    .filter(Boolean)
    .join(", ");
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const input = adminCreateMemberSchema.parse(await request.json());
    const prisma = getPrisma();

    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      return apiError("An account with this email already exists", 409);
    }

    const existingUsername = await findUserByUsername(prisma, input.username);

    if (existingUsername) {
      return apiError("This username is already taken", 409);
    }

    const user = await createMemberUser({
      fullName: input.fullName,
      username: input.username,
      email: input.email,
      phone: input.phone,
      passwordHash: await hashPassword(input.password),
      status: input.status,
      emailVerifiedAt: input.markEmailVerified ? new Date() : null,
      statusNote: input.statusNote ?? null,
      dateOfBirth: input.dateOfBirth,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2 ?? null,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      country: input.country,
      occupation: input.occupation,
      accountTypes: input.accountTypes,
      kycStatus: input.kycStatus,
    });

    const formattedDob = input.dateOfBirth.toISOString().slice(0, 10);
    const formattedAddress = formatMemberAddress(input);

    if (input.markEmailVerified) {
      void sendWelcomeEmail({
        email: user.email,
        fullName: user.fullName,
        userId: user.id,
      });
    } else {
      const challenge = await createEmailVerificationOtpChallenge(user.id);
      void sendEmailVerificationOtpEmail({
        email: user.email,
        fullName: user.fullName,
        code: challenge.code,
        expiresMinutes: challenge.expiresMinutes,
      });
    }

    if (input.status === "ACTIVE") {
      void sendAccountStatusEmail({
        email: user.email,
        fullName: user.fullName,
        userId: user.id,
        status: "ACTIVE",
        statusNote: input.statusNote,
      });
    }

    await logAdminAction({
      adminId: auth.admin.id,
      action: "CREATE_MEMBER",
      entityType: "User",
      entityId: user.id,
      details: {
        email: user.email,
        username: user.username,
        status: user.status,
        kycStatus: input.kycStatus,
        accountTypes: describeRequestedAccounts(input.accountTypes),
        markEmailVerified: input.markEmailVerified,
      },
    });

    void writeAdminEvent({
      eventType: "MEMBER_CREATED_BY_ADMIN",
      actorId: auth.admin.id,
      entityId: user.id,
      message: `${auth.admin.fullName} created member ${user.fullName}.`,
      metadata: {
        username: user.username,
        email: user.email,
        phone: user.phone,
        dateOfBirth: formattedDob,
        occupation: input.occupation,
        address: formattedAddress,
        accountTypes: describeRequestedAccounts(input.accountTypes),
        status: user.status,
        kycStatus: input.kycStatus,
      },
    });

    const created = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      include: {
        customerProfile: { select: { kycStatus: true } },
      },
    });

    return apiSuccess(
      {
        user: serializeUser(created),
        message: input.markEmailVerified
          ? "Member created. They can sign in with the username and password you set."
          : "Member created. A verification code was sent to their email before sign-in.",
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);

    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as UserStatus | null;
    const role = searchParams.get("role") as UserRole | null;
    const kycStatus = searchParams.get("kycStatus") as KycStatus | null;
    const search = searchParams.get("search")?.trim();
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const users = await getPrisma().user.findMany({
      where: {
        ...(includeDeleted ? {} : { deletedAt: null }),
        ...(status ? { status } : {}),
        ...(role ? { role } : {}),
        ...(kycStatus
          ? {
              customerProfile: { kycStatus },
            }
          : {}),
        ...(search
          ? {
              OR: [
                { email: { contains: search, mode: "insensitive" } },
                { username: { contains: search, mode: "insensitive" } },
                { fullName: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        customerProfile: { select: { kycStatus: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return apiSuccess({
      users: users.map(serializeUser),
    });
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

    const input = adminUpdateUserStatusSchema.parse(await request.json());
    const prisma = getPrisma();

    const existing = await prisma.user.findUnique({
      where: { id: input.userId },
    });

    if (!existing) {
      return apiError("User not found", 404);
    }

    if (existing.role === "ADMIN" && (input.action === "DELETE" || input.action === "PURGE")) {
      return apiError("Operations admin accounts cannot be deleted.", 400);
    }

    if (input.action === "PURGE") {
      const purged = await purgeMemberUser({
        userId: input.userId,
        actorAdminId: auth.admin.id,
      });

      await logAdminAction({
        adminId: auth.admin.id,
        action: "PURGE_MEMBER",
        entityType: "User",
        entityId: purged.userId,
        details: {
          email: purged.email,
          username: purged.username,
          fullName: purged.fullName,
        },
      });

      void writeAdminEvent({
        eventType: "MEMBER_PURGED",
        actorId: auth.admin.id,
        entityId: purged.userId,
        message: `${auth.admin.fullName} permanently deleted member ${purged.fullName}.`,
        metadata: {
          email: purged.email,
          username: purged.username,
        },
      });

      return apiSuccess({
        purged: true,
        userId: purged.userId,
        message: `${purged.fullName} was permanently deleted from the system.`,
      });
    }

    let generatedPin: string | null = null;
    let nextStatus = existing.status;
    let nextDeletedAt = existing.deletedAt;
    let nextStatusNote = input.statusNote ?? existing.statusNote;
    let nextUnrestricted = existing.transactionsUnrestricted;

    if (input.action === "REINSTATE") {
      nextStatus = "ACTIVE";
      nextDeletedAt = null;
      nextStatusNote = input.statusNote ?? null;
    } else if (input.action === "DELETE") {
      nextStatus = "DISABLED";
      nextDeletedAt = new Date();
      nextStatusNote = input.statusNote ?? "Account closed by member services.";
    } else if (input.action === "GENERATE_TRANSACTION_PIN") {
      generatedPin = generateSixDigitCode();
      await setUserTransactionPin({ userId: existing.id, pin: generatedPin });
    } else if (input.action === "CLEAR_TRANSACTION_PIN") {
      await clearUserTransactionPin(existing.id);
    }

    if (input.status) {
      nextStatus = input.status;
    }

    if (input.transactionsUnrestricted !== undefined) {
      nextUnrestricted = input.transactionsUnrestricted;
    }

    await prisma.user.update({
      where: { id: input.userId },
      data: {
        status: nextStatus,
        deletedAt: nextDeletedAt,
        statusNote: nextStatusNote,
        transactionsUnrestricted: nextUnrestricted,
      },
    });

    if (nextStatus === "ACTIVE" && existing.role === "USER") {
      await provisionMembershipAccounts(input.userId);
    }

    const updated = await prisma.user.findUniqueOrThrow({
      where: { id: input.userId },
      include: {
        customerProfile: { select: { kycStatus: true } },
      },
    });

    if (
      shouldRevokeSessionsOnStatusChange(nextStatus) ||
      input.action === "DELETE" ||
      nextDeletedAt
    ) {
      await revokeAllUserSessions(updated.id);
    }

    await logAdminAction({
      adminId: auth.admin.id,
      action: input.action ?? "UPDATE_USER_STATUS",
      entityType: "User",
      entityId: updated.id,
      details: {
        previousStatus: existing.status,
        nextStatus: updated.status,
        email: updated.email,
        transactionsUnrestricted: updated.transactionsUnrestricted,
        action: input.action ?? null,
      },
    });

    void createAccountNotification({
      userId: updated.id,
      title: "Account status updated",
      message:
        input.action === "DELETE"
          ? "Your Bluewave account has been closed by member services."
          : input.transactionsUnrestricted !== undefined
            ? updated.transactionsUnrestricted
              ? "Your account can now submit transfers without additional verification or review."
              : "Standard transfer verification and review controls were restored to your account."
            : `Your Bluewave membership status is now ${updated.status.toLowerCase().replace(/_/g, " ")}.`,
      metadata: {
        status: updated.status,
        href: "/auth/dashboard",
      },
    });

    void writeAdminEvent({
      eventType: "USER_STATUS_UPDATED",
      actorId: auth.admin.id,
      entityId: updated.id,
      message: `User ${updated.email} updated by operations.`,
      metadata: {
        previousStatus: existing.status,
        nextStatus: updated.status,
        action: input.action ?? null,
        transactionsUnrestricted: updated.transactionsUnrestricted,
      },
    });

    if (existing.status !== updated.status && updated.role === "USER") {
      void sendAccountStatusEmail({
        email: updated.email,
        fullName: updated.fullName,
        userId: updated.id,
        status: updated.status,
        statusNote: updated.statusNote,
      });
    }

    if (generatedPin) {
      void sendTransactionPinEmail({
        email: updated.email,
        fullName: updated.fullName,
        pin: generatedPin,
      });
    }

    return apiSuccess({ user: serializeUser(updated) });
  } catch (error) {
    if (error instanceof PurgeMemberUserError) {
      return apiError(error.message, error.status);
    }

    return handleApiError(error);
  }
}
