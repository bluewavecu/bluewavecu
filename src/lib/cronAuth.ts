import type { NextRequest } from "next/server";
import { apiError } from "@/lib/api";
import { getServerEnv, tryGetServerEnv } from "@/lib/env";

export function verifyCronSecret(request: NextRequest) {
  const env = tryGetServerEnv();
  const cronSecret = process.env.CRON_SECRET?.trim();

  if (env?.NODE_ENV === "production" && !cronSecret) {
    return {
      ok: false as const,
      response: apiError("Cron secret is not configured", 500),
    };
  }

  if (!cronSecret) {
    return {
      ok: false as const,
      response: apiError("Unauthorized", 401),
    };
  }

  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${cronSecret}`) {
    return {
      ok: false as const,
      response: apiError("Unauthorized", 401),
    };
  }

  return { ok: true as const, env: env ?? getServerEnv() };
}
