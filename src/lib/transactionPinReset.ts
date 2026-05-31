import { createHash } from "crypto";
import { generateSixDigitCode } from "@/lib/transactionOtp";
import { getPrisma } from "@/lib/prisma";

const TRANSACTION_PIN_RESET_TTL_MS = 15 * 60 * 1000;

function hashOtpCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export async function createTransactionPinResetChallenge(userId: string) {
  const code = generateSixDigitCode();
  const expiresAt = new Date(Date.now() + TRANSACTION_PIN_RESET_TTL_MS);
  const prisma = getPrisma();

  await prisma.transactionPinResetOtp.deleteMany({
    where: {
      userId,
      consumedAt: null,
    },
  });

  const challenge = await prisma.transactionPinResetOtp.create({
    data: {
      userId,
      codeHash: hashOtpCode(code),
      expiresAt,
    },
  });

  return {
    challengeId: challenge.id,
    code,
    expiresAt,
    expiresMinutes: TRANSACTION_PIN_RESET_TTL_MS / 60_000,
  };
}

export async function verifyTransactionPinResetChallenge(params: {
  userId: string;
  challengeId: string;
  otpCode: string;
}) {
  const prisma = getPrisma();
  const challenge = await prisma.transactionPinResetOtp.findFirst({
    where: {
      id: params.challengeId,
      userId: params.userId,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!challenge) {
    return {
      ok: false as const,
      message: "Verification code expired or not found. Request a new code.",
    };
  }

  if (hashOtpCode(params.otpCode) !== challenge.codeHash) {
    return { ok: false as const, message: "Invalid verification code." };
  }

  await prisma.transactionPinResetOtp.update({
    where: { id: challenge.id },
    data: { consumedAt: new Date() },
  });

  return { ok: true as const };
}
