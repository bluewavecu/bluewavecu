import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { getAuthTokenFromRequest, verifyAuthToken } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import type { MfaSettingRecord, MfaSettingsData } from "@/types/banking";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(request);
    const payload = token ? verifyAuthToken(token) : null;

    if (!payload) {
      return apiError("Unauthorized", 401);
    }

    const settings = await getPrisma().mfaSetting.findMany({
      where: { userId: payload.userId },
      orderBy: { method: "asc" },
    });

    const serialized: MfaSettingRecord[] =
      settings.length > 0
        ? settings.map((setting) => ({
            method: setting.method,
            isEnabled: setting.isEnabled,
            verifiedAt: setting.verifiedAt?.toISOString() ?? null,
          }))
        : [{ method: "EMAIL", isEnabled: false, verifiedAt: null }];

    const data: MfaSettingsData = { settings: serialized };

    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
