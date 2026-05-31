import { createHash } from "crypto";
import { generateSixDigitCode } from "@/lib/transactionOtp";
import { getPrisma } from "@/lib/prisma";

const EMAIL_VERIFICATION_OTP_TTL_MS = 15 * 60 * 1000;

function hashOtpCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export async function createEmailVerificationOtpChallenge(userId: string) {
  const code = generateSixDigitCode();
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_OTP_TTL_MS);
  const prisma = getPrisma();

  await prisma.emailVerificationOtp.deleteMany({
    where: {
      userId,
      consumedAt: null,
    },
  });

  const challenge = await prisma.emailVerificationOtp.create({
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
    expiresMinutes: EMAIL_VERIFICATION_OTP_TTL_MS / 60_000,
  };
}

export async function verifyEmailVerificationOtpChallenge(params: {
  challengeId: string;
  otpCode: string;
}) {
  const prisma = getPrisma();
  const challenge = await prisma.emailVerificationOtp.findFirst({
    where: {
      id: params.challengeId,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!challenge) {
    return {
      ok: false as const,
      message: "Verification code expired or not found. Request a new code.",
    };
  }

  if (challenge.user.emailVerifiedAt) {
    return {
      ok: false as const,
      message: "This email is already verified. You can sign in now.",
    };
  }

  if (hashOtpCode(params.otpCode) !== challenge.codeHash) {
    return { ok: false as const, message: "Invalid verification code." };
  }

  await prisma.$transaction([
    prisma.emailVerificationOtp.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: challenge.userId },
      data: { emailVerifiedAt: new Date() },
    }),
  ]);

  return {
    ok: true as const,
    user: challenge.user,
  };
}
