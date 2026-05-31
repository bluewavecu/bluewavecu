import { generateSixDigitCode } from "@/lib/transactionOtp";
import { getPrisma } from "@/lib/prisma";
import type { TransferOtpStepKey } from "@/types/banking";

export const TRANSFER_OTP_STEP_DEFINITIONS: Array<{
  stepKey: TransferOtpStepKey;
  label: string;
  description: string;
  order: number;
}> = [
  {
    stepKey: "IDENTITY_CHECK",
    label: "Identity check",
    description: "Confirms the member initiating the transfer.",
    order: 1,
  },
  {
    stepKey: "AMOUNT_CONFIRMATION",
    label: "Amount confirmation",
    description: "Confirms the transfer amount before release.",
    order: 2,
  },
  {
    stepKey: "BENEFICIARY_VERIFICATION",
    label: "Beneficiary verification",
    description: "Confirms recipient details for the transfer.",
    order: 3,
  },
  {
    stepKey: "SECURITY_CLEARANCE",
    label: "Security clearance",
    description: "Additional security review for high-risk transfers.",
    order: 4,
  },
  {
    stepKey: "FINAL_RELEASE",
    label: "Final release",
    description: "Final authorization before the transfer is submitted.",
    order: 5,
  },
];

const STEP_KEYS = TRANSFER_OTP_STEP_DEFINITIONS.map((step) => step.stepKey);

function normalizeCode(code: string) {
  return code.trim();
}

function isValidCode(code: string) {
  return /^\d{6}$/.test(normalizeCode(code));
}

function getStepDefinition(stepKey: TransferOtpStepKey) {
  return TRANSFER_OTP_STEP_DEFINITIONS.find((step) => step.stepKey === stepKey);
}

export class MemberTransferOtpError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "MemberTransferOtpError";
    this.code = code;
  }
}

export type MemberTransferOtpStepRecord = {
  stepKey: TransferOtpStepKey;
  label: string;
  description: string;
  order: number;
  enabled: boolean;
  code: string | null;
  updatedAt: string | null;
};

export type MemberTransferOtpStepRequirement = {
  stepKey: TransferOtpStepKey;
  label: string;
  order: number;
};

function serializeStep(
  stepKey: TransferOtpStepKey,
  record?: { enabled: boolean; code: string | null; updatedAt: Date } | null,
): MemberTransferOtpStepRecord {
  const definition = getStepDefinition(stepKey)!;

  return {
    stepKey,
    label: definition.label,
    description: definition.description,
    order: definition.order,
    enabled: record?.enabled ?? false,
    code: record?.code ?? null,
    updatedAt: record?.updatedAt.toISOString() ?? null,
  };
}

export async function getMemberTransferOtpSteps(userId: string) {
  const records = await getPrisma().memberTransferOtpStep.findMany({
    where: { userId },
  });

  const recordMap = new Map(records.map((record) => [record.stepKey, record]));

  return TRANSFER_OTP_STEP_DEFINITIONS.map((definition) =>
    serializeStep(definition.stepKey, recordMap.get(definition.stepKey)),
  );
}

export async function getEnabledMemberTransferOtpRequirements(userId: string) {
  const steps = await getMemberTransferOtpSteps(userId);

  return steps
    .filter((step) => step.enabled)
    .map(({ stepKey, label, order }) => ({ stepKey, label, order }));
}

export async function updateMemberTransferOtpStep(params: {
  userId: string;
  stepKey: TransferOtpStepKey;
  enabled: boolean;
  code?: string;
  adminId: string;
}) {
  if (!STEP_KEYS.includes(params.stepKey)) {
    throw new MemberTransferOtpError("Invalid transfer verification step.", "INVALID_STEP");
  }

  const existing = await getPrisma().memberTransferOtpStep.findUnique({
    where: {
      userId_stepKey: {
        userId: params.userId,
        stepKey: params.stepKey,
      },
    },
  });

  let nextCode = existing?.code ?? null;

  if (params.enabled) {
    if (params.code !== undefined) {
      if (!isValidCode(params.code)) {
        throw new MemberTransferOtpError("Verification code must be 6 digits.", "INVALID_CODE");
      }

      nextCode = normalizeCode(params.code);
    } else if (!nextCode) {
      nextCode = generateSixDigitCode();
    }
  } else {
    nextCode = null;
  }

  const saved = await getPrisma().memberTransferOtpStep.upsert({
    where: {
      userId_stepKey: {
        userId: params.userId,
        stepKey: params.stepKey,
      },
    },
    update: {
      enabled: params.enabled,
      code: nextCode,
      updatedBy: params.adminId,
    },
    create: {
      userId: params.userId,
      stepKey: params.stepKey,
      enabled: params.enabled,
      code: nextCode,
      updatedBy: params.adminId,
    },
  });

  return serializeStep(params.stepKey, saved);
}

export async function updateMemberTransferOtpSteps(params: {
  userId: string;
  adminId: string;
  updates: Array<{
    stepKey: TransferOtpStepKey;
    enabled: boolean;
    code?: string;
  }>;
}) {
  const results: MemberTransferOtpStepRecord[] = [];

  for (const update of params.updates) {
    results.push(
      await updateMemberTransferOtpStep({
        userId: params.userId,
        stepKey: update.stepKey,
        enabled: update.enabled,
        code: update.code,
        adminId: params.adminId,
      }),
    );
  }

  return results;
}

export function verifyMemberTransferOtpCodes(params: {
  enabledSteps: MemberTransferOtpStepRecord[];
  stepOtpCodes?: Partial<Record<TransferOtpStepKey, string>>;
}) {
  const enabledSteps = params.enabledSteps.filter((step) => step.enabled);

  if (enabledSteps.length === 0) {
    return { ok: true as const };
  }

  if (!params.stepOtpCodes) {
    return {
      ok: false as const,
      message: "Transfer verification codes are required.",
    };
  }

  for (const step of enabledSteps) {
    const submitted = params.stepOtpCodes[step.stepKey];

    if (!submitted) {
      return {
        ok: false as const,
        message: `${step.label} code is required.`,
      };
    }

    if (!isValidCode(submitted)) {
      return {
        ok: false as const,
        message: `${step.label} code must be 6 digits.`,
      };
    }

    if (normalizeCode(submitted) !== step.code) {
      return {
        ok: false as const,
        message: `${step.label} code is incorrect.`,
      };
    }
  }

  return { ok: true as const };
}

export async function verifyMemberTransferOtpCodesForUser(params: {
  userId: string;
  stepOtpCodes?: Partial<Record<TransferOtpStepKey, string>>;
}) {
  const steps = await getMemberTransferOtpSteps(params.userId);
  const enabledSteps = steps.filter((step) => step.enabled);

  return verifyMemberTransferOtpCodes({
    enabledSteps,
    stepOtpCodes: params.stepOtpCodes,
  });
}
