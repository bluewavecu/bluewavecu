import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api";
import { resolveRequestAuth } from "@/lib/requestAuth";

import { getPrisma } from "@/lib/prisma";
import type { MfaSettingRecord, MfaSettingsData } from "@/types/banking";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveRequestAuth(request);
    if (!auth.ok) {
      return auth.response;
    }
    const payload = auth.payload;

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
