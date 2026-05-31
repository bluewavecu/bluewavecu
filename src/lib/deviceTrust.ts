import { createHash, randomUUID } from "crypto";
import type { NextRequest } from "next/server";
import { tryGetServerEnv } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { deriveDeviceName, getClientIp, getUserAgent } from "@/lib/requestContext";

export const DEVICE_COOKIE_NAME = "bluewave_device";
export const DEVICE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function hashDeviceToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function generateDeviceToken() {
  return randomUUID();
}

export function getDeviceTokenFromRequest(request: NextRequest) {
  return request.cookies.get(DEVICE_COOKIE_NAME)?.value ?? null;
}

export function createDeviceCookie(token: string) {
  const env = tryGetServerEnv();
  const isProduction = env?.NODE_ENV === "production" || process.env.NODE_ENV === "production";

  return {
    name: DEVICE_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction,
    path: "/",
    maxAge: DEVICE_COOKIE_MAX_AGE_SECONDS,
  };
}

export async function isTrustedDevice(userId: string, deviceToken: string | null | undefined) {
  if (!deviceToken) {
    return false;
  }

  const trustedDevice = await getPrisma().trustedDevice.findFirst({
    where: {
      userId,
      tokenHash: hashDeviceToken(deviceToken),
      revokedAt: null,
    },
    select: { id: true },
  });

  return Boolean(trustedDevice);
}

export async function trustDevice(params: {
  userId: string;
  request: NextRequest;
  deviceToken: string;
}) {
  const ipAddress = getClientIp(params.request);
  const userAgent = getUserAgent(params.request);
  const tokenHash = hashDeviceToken(params.deviceToken);
  const prisma = getPrisma();

  const existing = await prisma.trustedDevice.findFirst({
    where: {
      userId: params.userId,
      tokenHash,
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.trustedDevice.update({
      where: { id: existing.id },
      data: {
        deviceName: deriveDeviceName(userAgent),
        userAgent,
        ipAddress,
        lastUsedAt: new Date(),
        revokedAt: null,
      },
    });
    return;
  }

  await prisma.trustedDevice.create({
    data: {
      userId: params.userId,
      tokenHash,
      deviceName: deriveDeviceName(userAgent),
      userAgent,
      ipAddress,
    },
  });
}

export async function touchTrustedDevice(userId: string, deviceToken: string | null | undefined) {
  if (!deviceToken) {
    return;
  }

  await getPrisma().trustedDevice.updateMany({
    where: {
      userId,
      tokenHash: hashDeviceToken(deviceToken),
      revokedAt: null,
    },
    data: {
      lastUsedAt: new Date(),
    },
  });
}
