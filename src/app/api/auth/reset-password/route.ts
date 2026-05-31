import type { NextRequest } from "next/server";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { sendPasswordChangedEmail } from "@/lib/email";
import { writeEventLog } from "@/lib/eventLog";
import {
  consumePasswordReset,
  verifyPasswordResetChallenge,
} from "@/lib/passwordReset";
import { getPrisma } from "@/lib/prisma";
import { enforceRateLimit, rateLimitPresets } from "@/lib/rateLimit";
import { revokeAllUserSessions } from "@/lib/sessions";
import { resetPasswordSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const rateLimit = enforceRateLimit(request, "auth-reset-password", rateLimitPresets.passwordReset);

    if (!rateLimit.allowed) {
      return apiError(rateLimit.message, 429);
    }

    const input = resetPasswordSchema.parse(await request.json());
    const verification = await verifyPasswordResetChallenge({
      token: input.token,
      email: input.email,
      code: input.code,
    });

    if (!verification.ok) {
      return apiError(verification.message, 400);
    }

    const { reset } = verification;
    const user = reset.user;
    const prisma = getPrisma();
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });

    if (!currentUser) {
      return apiError("This reset link or code is invalid or has expired.", 400);
    }

    const sameAsCurrent = await verifyPassword(input.newPassword, currentUser.passwordHash);

    if (sameAsCurrent) {
      return apiError("Choose a password that is different from your current password.", 400);
    }

    const passwordHash = await hashPassword(input.newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await consumePasswordReset(reset.id);
    await revokeAllUserSessions(user.id);

    void writeEventLog({
      eventType: "PASSWORD_CHANGED",
      entityType: "User",
      entityId: user.id,
      actorId: user.id,
      message: "Password reset completed successfully.",
      severity: "INFO",
    });

    void sendPasswordChangedEmail({
      email: user.email,
      fullName: user.fullName,
      userId: user.id,
    });

    return apiSuccess({
      message: "Your password was updated. Sign in with your new password.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
