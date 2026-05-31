import { ADMIN_AUTH_PATH, MEMBER_AUTH_PATH, REGISTER_PATH } from "@/lib/authRoutes";

const SAFE_REDIRECT_PREFIXES = [
  "/dashboard",
  "/accounts",
  "/transactions",
  "/transfers",
  "/bill-pay",
  "/disputes",
  "/cards",
  "/member",
  "/admin",
];

export { buildAdminAuthUrl, buildMemberAuthUrl, buildLoginUrl } from "@/lib/authRoutes";

export function getSafeRedirectPath(next: string | null | undefined, role?: "USER" | "ADMIN") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return role === "ADMIN" ? "/admin" : "/dashboard";
  }

  if (
    next.startsWith(MEMBER_AUTH_PATH) ||
    next.startsWith(ADMIN_AUTH_PATH) ||
    next.startsWith("/login") ||
    next.startsWith(REGISTER_PATH)
  ) {
    return role === "ADMIN" ? "/admin" : "/dashboard";
  }

  const isAllowed = SAFE_REDIRECT_PREFIXES.some(
    (prefix) => next === prefix || next.startsWith(`${prefix}/`),
  );

  if (!isAllowed) {
    return role === "ADMIN" ? "/admin" : "/dashboard";
  }

  if (next.startsWith("/admin") && role !== "ADMIN") {
    return "/dashboard";
  }

  return next;
}

export function isServerSideError(message: string | null | undefined) {
  if (!message) {
    return false;
  }

  return (
    message.includes("Unexpected server error") ||
    message.includes("Unable to reach Bluewave services") ||
    message.includes("Environment validation failed")
  );
}
