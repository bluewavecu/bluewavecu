import type { Prisma } from "@/generated/prisma/client";
import { generateUniqueAccountNumber } from "@/lib/accountNumbers";
import { getAccountDisplayName } from "@/lib/bankingSerialize";
import { INSTITUTION } from "@/lib/institution";
import { getPrisma } from "@/lib/prisma";
import type { SignupAccountType } from "@/data/signupAccountTypes";
import { formatSignupAccountTypes } from "@/data/signupAccountTypes";

type TransactionClient = Prisma.TransactionClient;

export async function createPendingMembershipAccounts(params: {
  userId: string;
  accountTypes: SignupAccountType[];
  tx?: TransactionClient;
}) {
  const prisma = params.tx ?? getPrisma();
  const uniqueTypes = [...new Set(params.accountTypes)];

  await Promise.all(
    uniqueTypes.map((accountType) =>
      prisma.account.create({
        data: {
          userId: params.userId,
          accountType,
          accountNumber: null,
          routingNumber: INSTITUTION.routingNumber,
          status: "PENDING_APPROVAL",
          balance: 0,
          availableBalance: 0,
          currency: "USD",
        },
      }),
    ),
  );
}

export async function provisionMembershipAccounts(userId: string, tx?: TransactionClient) {
  const prisma = tx ?? getPrisma();
  const pendingAccounts = await prisma.account.findMany({
    where: {
      userId,
      status: "PENDING_APPROVAL",
      accountNumber: null,
    },
    orderBy: { createdAt: "asc" },
  });

  for (const account of pendingAccounts) {
    const accountNumber = await generateUniqueAccountNumber(prisma);

    await prisma.account.update({
      where: { id: account.id },
      data: {
        accountNumber,
        status: "ACTIVE",
      },
    });
  }

  return pendingAccounts.length;
}

export function describeRequestedAccounts(accountTypes: SignupAccountType[]) {
  return formatSignupAccountTypes(accountTypes);
}

export function describeAccountType(accountType: SignupAccountType | string) {
  return getAccountDisplayName(accountType as SignupAccountType);
}
