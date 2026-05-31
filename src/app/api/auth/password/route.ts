import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveMemberWriteAuth } from "@/lib/requestAuth";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { writeEventLog } from "@/lib/eventLog";
import { sendPasswordChangedEmail } from "@/lib/email";
import { getPrisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveMemberWriteAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const input = changePasswordSchema.parse(await request.json());
    const prisma = getPrisma();

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, fullName: true, passwordHash: true },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    const currentMatches = await verifyPassword(input.currentPassword, user.passwordHash);

    if (!currentMatches) {
      return apiError("Current password is incorrect", 400);
    }

    const passwordHash = await hashPassword(input.newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    void writeEventLog({
      eventType: "PASSWORD_CHANGED",
      entityType: "User",
      entityId: user.id,
      actorId: user.id,
      message: "Password updated successfully.",
      severity: "INFO",
    });

    void sendPasswordChangedEmail({
      email: user.email,
      fullName: user.fullName,
      userId: user.id,
    });

    return apiSuccess({ message: "Password updated successfully." });
  } catch (error) {
    return handleApiError(error);
  }
}
