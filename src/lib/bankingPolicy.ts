import { getPrisma } from "@/lib/prisma";

export type BankingPolicySettings = {
  requireTransactionOtp: boolean;
  requireTransferReview: boolean;
  updatedAt: string;
  updatedBy: string | null;
};

const DEFAULT_POLICY = {
  id: "default",
  requireTransactionOtp: true,
  requireTransferReview: true,
} as const;

export async function getBankingPolicy(): Promise<BankingPolicySettings> {
  const prisma = getPrisma();
  const policy = await prisma.bankingPolicy.upsert({
    where: { id: DEFAULT_POLICY.id },
    update: {},
    create: {
      id: DEFAULT_POLICY.id,
      requireTransactionOtp: DEFAULT_POLICY.requireTransactionOtp,
      requireTransferReview: DEFAULT_POLICY.requireTransferReview,
    },
  });

  return {
    requireTransactionOtp: policy.requireTransactionOtp,
    requireTransferReview: policy.requireTransferReview,
    updatedAt: policy.updatedAt.toISOString(),
    updatedBy: policy.updatedBy,
  };
}

export async function updateBankingPolicy(params: {
  requireTransactionOtp?: boolean;
  requireTransferReview?: boolean;
  updatedBy: string;
}) {
  const prisma = getPrisma();

  const policy = await prisma.bankingPolicy.upsert({
    where: { id: DEFAULT_POLICY.id },
    update: {
      ...(params.requireTransactionOtp !== undefined
        ? { requireTransactionOtp: params.requireTransactionOtp }
        : {}),
      ...(params.requireTransferReview !== undefined
        ? { requireTransferReview: params.requireTransferReview }
        : {}),
      updatedBy: params.updatedBy,
    },
    create: {
      id: DEFAULT_POLICY.id,
      requireTransactionOtp: params.requireTransactionOtp ?? DEFAULT_POLICY.requireTransactionOtp,
      requireTransferReview: params.requireTransferReview ?? DEFAULT_POLICY.requireTransferReview,
      updatedBy: params.updatedBy,
    },
  });

  return {
    requireTransactionOtp: policy.requireTransactionOtp,
    requireTransferReview: policy.requireTransferReview,
    updatedAt: policy.updatedAt.toISOString(),
    updatedBy: policy.updatedBy,
  };
}

export function userRequiresTransactionOtp(params: {
  transactionsUnrestricted: boolean;
  policy: Pick<BankingPolicySettings, "requireTransactionOtp">;
}) {
  if (params.transactionsUnrestricted) {
    return false;
  }

  return params.policy.requireTransactionOtp;
}

export function userRequiresTransferReview(params: {
  transactionsUnrestricted: boolean;
  policy: Pick<BankingPolicySettings, "requireTransferReview">;
}) {
  if (params.transactionsUnrestricted) {
    return false;
  }

  return params.policy.requireTransferReview;
}
