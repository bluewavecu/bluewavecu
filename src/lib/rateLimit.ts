import type { NextRequest } from "next/server";

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

export function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export function checkRateLimit(key: string, options: RateLimitOptions) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return { allowed: true as const };
  }

  if (bucket.count >= options.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

    return {
      allowed: false as const,
      retryAfterSeconds,
      message: `Too many requests. Try again in ${retryAfterSeconds} seconds.`,
    };
  }

  bucket.count += 1;
  buckets.set(key, bucket);

  return { allowed: true as const };
}

export function enforceRateLimit(
  request: NextRequest,
  routeKey: string,
  options: RateLimitOptions,
) {
  const ip = getClientIp(request);
  return checkRateLimit(`${routeKey}:${ip}`, options);
}

export const rateLimitPresets = {
  login: { limit: 10, windowMs: 15 * 60 * 1000 },
  register: { limit: 5, windowMs: 60 * 60 * 1000 },
  transfer: { limit: 10, windowMs: 15 * 60 * 1000 },
  support: { limit: 8, windowMs: 15 * 60 * 1000 },
  contact: { limit: 5, windowMs: 15 * 60 * 1000 },
  passwordReset: { limit: 5, windowMs: 15 * 60 * 1000 },
  verifyEmail: { limit: 10, windowMs: 15 * 60 * 1000 },
} as const;
