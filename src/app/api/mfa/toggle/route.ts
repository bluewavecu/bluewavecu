import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import { MEMBER_SECURITY_PATH } from "@/lib/memberRoutes";
import { createSecurityNotification } from "@/lib/notifications";
import { getPrisma } from "@/lib/prisma";
import { mfaToggleSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Unauthorized", 401);
    }

    const input = mfaToggleSchema.parse(await request.json());

    if (input.method !== "EMAIL") {
      return apiError("Only email MFA placeholder is available in this step.", 400);
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
      title: input.enabled ? "Email MFA enabled" : "Email MFA disabled",
      message: input.enabled
        ? "Email verification MFA foundation is enabled. OTP delivery will activate in a later step."
        : "Email verification MFA was disabled on your account.",
      metadata: { href: MEMBER_SECURITY_PATH, method: input.method },
    });

    return apiSuccess({
      setting: {
        method: setting.method,
        isEnabled: setting.isEnabled,
        verifiedAt: setting.verifiedAt?.toISOString() ?? null,
      },
      message: input.enabled
        ? "Email MFA placeholder enabled."
        : "Email MFA placeholder disabled.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
