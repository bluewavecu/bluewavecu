import type { NextRequest } from "next/server";

export function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function getUserAgent(request: NextRequest) {
  return request.headers.get("user-agent")?.trim() || "unknown";
}

export function deriveDeviceName(userAgent: string) {
  const agent = userAgent.toLowerCase();

  if (agent.includes("iphone")) {
    return "iPhone";
  }

  if (agent.includes("ipad")) {
    return "iPad";
  }

  if (agent.includes("android")) {
    return "Android device";
  }

  if (agent.includes("macintosh") || agent.includes("mac os")) {
    return "Mac";
  }

  if (agent.includes("windows")) {
    return "Windows PC";
  }

  if (agent.includes("linux")) {
    return "Linux device";
  }

  return "Web browser";
}
