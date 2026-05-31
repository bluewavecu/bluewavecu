import type { Prisma } from "@/generated/prisma/client";
import type { SignupAccountType } from "@/data/signupAccountTypes";
import { createPendingMembershipAccounts, provisionMembershipAccounts } from "@/lib/memberAccounts";
import { getPrisma } from "@/lib/prisma";
import type { KycStatus, UserStatus } from "@/types/banking";

export type CreateMemberUserInput = {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  passwordHash: string;
  status: UserStatus;
  emailVerifiedAt: Date | null;
  statusNote?: string | null;
  dateOfBirth: Date;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  occupation: string;
  annualIncome?: number;
  accountTypes: SignupAccountType[];
  kycStatus?: KycStatus;
};

async function createMemberUserInTransaction(
  tx: Prisma.TransactionClient,
  params: CreateMemberUserInput,
) {
  const user = await tx.user.create({
    data: {
      fullName: params.fullName,
      username: params.username,
      email: params.email,
      phone: params.phone,
      passwordHash: params.passwordHash,
      role: "USER",
      status: params.status,
      emailVerifiedAt: params.emailVerifiedAt,
      statusNote: params.statusNote ?? null,
    },
  });

  const kycStatus = params.kycStatus ?? "NOT_STARTED";

  await tx.customerProfile.create({
    data: {
      userId: user.id,
      dateOfBirth: params.dateOfBirth,
      addressLine1: params.addressLine1,
      addressLine2: params.addressLine2 ?? null,
      city: params.city,
      state: params.state,
      postalCode: params.postalCode,
      country: params.country,
      employmentStatus: params.occupation,
      ...(params.annualIncome !== undefined ? { annualIncome: params.annualIncome } : {}),
      kycStatus,
      ...(kycStatus === "VERIFIED" ? { kycReviewedAt: new Date() } : {}),
    },
  });

  await createPendingMembershipAccounts({
    userId: user.id,
    accountTypes: params.accountTypes,
    tx,
  });

  if (params.status === "ACTIVE") {
    await provisionMembershipAccounts(user.id, tx);
  }

  return user;
}

export async function createMemberUser(params: CreateMemberUserInput) {
  const prisma = getPrisma();
  return prisma.$transaction((tx) => createMemberUserInTransaction(tx, params));
}
