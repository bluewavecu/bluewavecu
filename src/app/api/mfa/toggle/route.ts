import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveRequestAuth } from "@/lib/requestAuth";

import { MEMBER_SECURITY_PATH } from "@/lib/memberRoutes";
import { createSecurityNotification } from "@/lib/notifications";
import { getPrisma } from "@/lib/prisma";
import { mfaToggleSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

    const input = mfaToggleSchema.parse(await request.json());

    if (input.method !== "EMAIL") {
      return apiError("Only email verification is available at this time.", 400);
    }

    const prisma = getPrisma();

    const setting = await prisma.mfaSetting.upsert({
      where: {
        userId_method: {
          userId: payload.userId,
          method: input.method,
        },
      },
      create: {
        userId: payload.userId,
        method: input.method,
        isEnabled: input.enabled,
        verifiedAt: input.enabled ? new Date() : null,
      },
      update: {
        isEnabled: input.enabled,
        verifiedAt: input.enabled ? new Date() : null,
      },
    });

    void createSecurityNotification({
      userId: payload.userId,
      title: input.enabled ? "Email verification enabled" : "Email verification disabled",
      message: input.enabled
        ? "Email verification is enabled for sign-in alerts on your account."
        : "Email verification alerts were disabled on your account.",
      metadata: { href: MEMBER_SECURITY_PATH, method: input.method },
    });

    return apiSuccess({
      setting: {
        method: setting.method,
        isEnabled: setting.isEnabled,
        verifiedAt: setting.verifiedAt?.toISOString() ?? null,
      },
      message: input.enabled
        ? "Email verification enabled."
        : "Email verification disabled.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
