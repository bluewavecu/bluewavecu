import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import { generateSixDigitCode } from "@/lib/transactionOtp";
import { getPrisma } from "@/lib/prisma";
import { deriveDeviceName, getClientIp, getUserAgent } from "@/lib/requestContext";
import { generateDeviceToken } from "@/lib/deviceTrust";

const LOGIN_OTP_TTL_MS = 10 * 60 * 1000;

function hashOtpCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export async function createLoginOtpChallenge(params: {
  userId: string;
  request: NextRequest;
}) {
  const code = generateSixDigitCode();
  const deviceToken = generateDeviceToken();
  const expiresAt = new Date(Date.now() + LOGIN_OTP_TTL_MS);
  const ipAddress = getClientIp(params.request);
  const userAgent = getUserAgent(params.request);
  const prisma = getPrisma();

  await prisma.loginOtp.deleteMany({
    where: {
      userId: params.userId,
      consumedAt: null,
    },
  });

  const challenge = await prisma.loginOtp.create({
    data: {
      userId: params.userId,
      codeHash: hashOtpCode(code),
      deviceToken,
      deviceName: deriveDeviceName(userAgent),
      userAgent,
      ipAddress,
      expiresAt,
    },
  });

  return {
    challengeId: challenge.id,
    code,
    deviceToken,
    expiresAt,
    deviceName: challenge.deviceName,
  };
}

export async function verifyLoginOtpChallenge(params: {
  userId: string;
  challengeId: string;
  otpCode: string;
}) {
  const prisma = getPrisma();
  const challenge = await prisma.loginOtp.findFirst({
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
      message: "Verification code expired or not found. Sign in again to request a new code.",
    };
  }

  if (hashOtpCode(params.otpCode) !== challenge.codeHash) {
    return { ok: false as const, message: "Invalid verification code." };
  }

  await prisma.loginOtp.update({
    where: { id: challenge.id },
    data: { consumedAt: new Date() },
  });

  return {
    ok: true as const,
    deviceToken: challenge.deviceToken,
  };
}
