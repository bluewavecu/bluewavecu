import {
  ADMIN_AUTH_PATH,
  ADMIN_DASHBOARD_PATH,
  MEMBER_BASE_PATH,
  MEMBER_LOGIN_PATH,
  MEMBER_REGISTER_PATH,
  REGISTER_PATH,
  isAdminPath,
} from "@/lib/authRoutes";
import { MEMBER_DASHBOARD_PATH } from "@/lib/memberRoutes";

const SAFE_REDIRECT_PREFIXES = [MEMBER_BASE_PATH, ADMIN_AUTH_PATH];

export { buildAdminAuthUrl, buildMemberAuthUrl, buildLoginUrl } from "@/lib/authRoutes";

export function getSafeRedirectPath(next: string | null | undefined, role?: "USER" | "ADMIN") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return role === "ADMIN" ? ADMIN_DASHBOARD_PATH : MEMBER_DASHBOARD_PATH;
  }

  if (
    next === MEMBER_LOGIN_PATH ||
    next === MEMBER_REGISTER_PATH ||
    next === ADMIN_AUTH_PATH ||
    next.startsWith("/login") ||
    next.startsWith(REGISTER_PATH) ||
    next === MEMBER_BASE_PATH
  ) {
    return role === "ADMIN" ? ADMIN_DASHBOARD_PATH : MEMBER_DASHBOARD_PATH;
  }

  const isAllowed = SAFE_REDIRECT_PREFIXES.some(
    (prefix) => next === prefix || next.startsWith(`${prefix}/`),
  );

  if (!isAllowed) {
    return role === "ADMIN" ? ADMIN_DASHBOARD_PATH : MEMBER_DASHBOARD_PATH;
  }

  if (isAdminPath(next) && role !== "ADMIN") {
    return MEMBER_DASHBOARD_PATH;
  }

  if (next.startsWith(`${MEMBER_BASE_PATH}/`) && isMemberAuthEntryRedirect(next)) {
    return MEMBER_DASHBOARD_PATH;
  }

  return next;
}

function isMemberAuthEntryRedirect(pathname: string) {
  return (
    pathname === MEMBER_LOGIN_PATH ||
    pathname === MEMBER_REGISTER_PATH ||
    pathname.startsWith(`${MEMBER_BASE_PATH}/forgot-password`) ||
    pathname.startsWith(`${MEMBER_BASE_PATH}/reset-password`)
  );
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
