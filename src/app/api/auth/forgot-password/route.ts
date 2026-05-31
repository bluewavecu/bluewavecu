import type { NextRequest } from "next/server";
import { hashPassword } from "@/lib/auth";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { sendPasswordResetEmail } from "@/lib/email";
import { getEmailAppUrl } from "@/lib/emailTemplate";
import { writeEventLog } from "@/lib/eventLog";
import {
  buildPasswordResetUrl,
  createPasswordResetChallenge,
} from "@/lib/passwordReset";
import { getPrisma } from "@/lib/prisma";
import { enforceRateLimit, rateLimitPresets } from "@/lib/rateLimit";
import { forgotPasswordSchema } from "@/lib/validators";

const GENERIC_SUCCESS_MESSAGE =
  "If an account exists for that email, we sent password reset instructions. Check your inbox and spam folder.";

export async function POST(request: NextRequest) {
  try {
    const rateLimit = enforceRateLimit(request, "auth-forgot-password", rateLimitPresets.passwordReset);

    if (!rateLimit.allowed) {
      return apiError(rateLimit.message, 429);
    }

    const input = forgotPasswordSchema.parse(await request.json());
    const prisma = getPrisma();

    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        deletedAt: true,
      },
    });

    if (user && user.role === "USER" && !user.deletedAt) {
      const challenge = await createPasswordResetChallenge(user.id);
      const resetUrl = buildPasswordResetUrl(challenge.token, getEmailAppUrl());

      void sendPasswordResetEmail({
        email: user.email,
        fullName: user.fullName,
        resetUrl,
        code: challenge.code,
        expiresMinutes: challenge.expiresMinutes,
      });

      void writeEventLog({
        eventType: "PASSWORD_RESET_REQUESTED",
        entityType: "User",
        entityId: user.id,
        actorId: user.id,
        message: "Password reset instructions sent by email.",
        severity: "INFO",
      });
    }

    return apiSuccess({ message: GENERIC_SUCCESS_MESSAGE });
  } catch (error) {
    return handleApiError(error);
  }
}
