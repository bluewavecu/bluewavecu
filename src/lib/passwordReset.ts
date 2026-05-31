import { createHash, randomBytes } from "crypto";
import { generateSixDigitCode } from "@/lib/transactionOtp";
import { getPrisma } from "@/lib/prisma";

const RESET_TTL_MS = 30 * 60 * 1000;

function hashResetValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function buildPasswordResetUrl(token: string, appUrl: string) {
  const base = appUrl.replace(/\/$/, "");
  return `${base}/auth/reset-password?token=${encodeURIComponent(token)}`;
}

export async function createPasswordResetChallenge(userId: string) {
  const token = randomBytes(32).toString("hex");
  const code = generateSixDigitCode();
  const expiresAt = new Date(Date.now() + RESET_TTL_MS);
  const prisma = getPrisma();

  await prisma.passwordReset.deleteMany({
    where: {
      userId,
      consumedAt: null,
    },
  });

  await prisma.passwordReset.create({
    data: {
      userId,
      tokenHash: hashResetValue(token),
      codeHash: hashResetValue(code),
      expiresAt,
    },
  });

  return {
    token,
    code,
    expiresAt,
    expiresMinutes: RESET_TTL_MS / 60_000,
  };
}

async function findActiveReset(params: { token?: string; email?: string; code?: string }) {
  const prisma = getPrisma();
  const now = new Date();

  if (params.token) {
    return prisma.passwordReset.findFirst({
      where: {
        tokenHash: hashResetValue(params.token),
        consumedAt: null,
        expiresAt: { gt: now },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            deletedAt: true,
          },
        },
      },
    });
  }

  if (!params.email || !params.code) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: params.email },
    select: { id: true },
  });

  if (!user) {
    return null;
  }

  return prisma.passwordReset.findFirst({
    where: {
      userId: user.id,
      codeHash: hashResetValue(params.code),
      consumedAt: null,
      expiresAt: { gt: now },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          deletedAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function verifyPasswordResetChallenge(params: {
  token?: string;
  email?: string;
  code?: string;
}) {
  const reset = await findActiveReset(params);

  if (!reset) {
    return { ok: false as const, message: "This reset link or code is invalid or has expired." };
  }

  if (reset.user.deletedAt) {
    return { ok: false as const, message: "This account is closed. Contact member services for help." };
  }

  if (reset.user.role === "ADMIN") {
    return { ok: false as const, message: "This reset link or code is invalid or has expired." };
  }

  return { ok: true as const, reset };
}

export async function consumePasswordReset(resetId: string) {
  await getPrisma().passwordReset.update({
    where: { id: resetId },
    data: { consumedAt: new Date() },
  });
}
