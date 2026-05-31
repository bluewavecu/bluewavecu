import { createHash, randomInt } from "crypto";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import type { TransferInput, TransferOtpRequestInput } from "@/lib/validators";

const OTP_TTL_MS = 10 * 60 * 1000;

export function normalizeTransferChallengePayload(
  payload: TransferInput | TransferOtpRequestInput,
) {
  const { transactionPin: _transactionPin, ...transferDetails } = payload as TransferInput;

  return JSON.stringify(transferDetails);
}

function hashOtpCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export function generateSixDigitCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function createTransferOtpChallenge(params: {
  userId: string;
  payload: TransferInput;
}) {
  const code = generateSixDigitCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  const prisma = getPrisma();

  await prisma.transactionOtp.deleteMany({
    where: {
      userId: params.userId,
      consumedAt: null,
    },
  });

  const challenge = await prisma.transactionOtp.create({
    data: {
      userId: params.userId,
      codeHash: hashOtpCode(code),
      payload: params.payload,
      expiresAt,
    },
  });

  return {
    challengeId: challenge.id,
    code,
    expiresAt,
  };
}

export async function verifyTransferOtpChallenge(params: {
  userId: string;
  otpCode: string;
  payload: TransferInput;
}) {
  const prisma = getPrisma();
  const challenge = await prisma.transactionOtp.findFirst({
    where: {
      userId: params.userId,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge) {
    return { ok: false as const, message: "Verification code expired or not found. Request a new code." };
  }

  if (hashOtpCode(params.otpCode) !== challenge.codeHash) {
    return { ok: false as const, message: "Invalid verification code." };
  }

  const storedPayload = challenge.payload as TransferInput;

  if (normalizeTransferChallengePayload(storedPayload) !== normalizeTransferChallengePayload(params.payload)) {
    return {
      ok: false as const,
      message: "Transfer details changed after verification. Request a new code.",
    };
  }

  await prisma.transactionOtp.update({
    where: { id: challenge.id },
    data: { consumedAt: new Date() },
  });

  return { ok: true as const };
}

export async function hashTransactionPin(pin: string) {
  return hashPassword(pin);
}

export async function verifyTransactionPin(pin: string, pinHash: string | null | undefined) {
  if (!pinHash) {
    return true;
  }

  return verifyPassword(pin, pinHash);
}

export async function setUserTransactionPin(params: { userId: string; pin: string }) {
  const pinHash = await hashTransactionPin(params.pin);

  await getPrisma().user.update({
    where: { id: params.userId },
    data: { transactionPinHash: pinHash },
  });

  return params.pin;
}

export async function clearUserTransactionPin(userId: string) {
  await getPrisma().user.update({
    where: { id: userId },
    data: { transactionPinHash: null },
  });
}
