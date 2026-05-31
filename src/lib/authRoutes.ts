export const MEMBER_BASE_PATH = "/auth";
export const MEMBER_LOGIN_PATH = "/auth/login";
export const MEMBER_REGISTER_PATH = "/auth/register";
export const MEMBER_VERIFY_EMAIL_PATH = "/auth/verify-email";
export const ADMIN_AUTH_PATH = "/lex/auth";
export const ADMIN_DASHBOARD_PATH = "/lex/auth/dashboard";
export const LEGACY_LOGIN_PATH = "/login";
export const LEGACY_REGISTER_PATH = "/register";
export const FORGOT_PASSWORD_PATH = "/auth/forgot-password";
export const RESET_PASSWORD_PATH = "/auth/reset-password";

/** @deprecated Use MEMBER_LOGIN_PATH */
export const MEMBER_AUTH_PATH = MEMBER_LOGIN_PATH;
/** @deprecated Use MEMBER_REGISTER_PATH */
export const REGISTER_PATH = MEMBER_REGISTER_PATH;

const MEMBER_AUTH_ENTRY_PATHS = [
  MEMBER_BASE_PATH,
  MEMBER_LOGIN_PATH,
  MEMBER_REGISTER_PATH,
  MEMBER_VERIFY_EMAIL_PATH,
  FORGOT_PASSWORD_PATH,
  RESET_PASSWORD_PATH,
  LEGACY_LOGIN_PATH,
  LEGACY_REGISTER_PATH,
];

export function adminConsolePath(...segments: string[]) {
  if (segments.length === 0) {
    return ADMIN_DASHBOARD_PATH;
  }

  return `${ADMIN_AUTH_PATH}/${segments.join("/")}`;
}

export function isLegacyAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isAdminPath(pathname: string) {
  if (pathname === ADMIN_AUTH_PATH) {
    return false;
  }

  return pathname.startsWith(`${ADMIN_AUTH_PATH}/`);
}

export function isMemberAuthPath(pathname: string) {
  if (
    pathname === MEMBER_BASE_PATH ||
    pathname === MEMBER_LOGIN_PATH ||
    pathname === MEMBER_REGISTER_PATH ||
    pathname === MEMBER_VERIFY_EMAIL_PATH ||
    pathname === LEGACY_LOGIN_PATH ||
    pathname === LEGACY_REGISTER_PATH
  ) {
    return true;
  }

  if (pathname === FORGOT_PASSWORD_PATH || pathname.startsWith(`${FORGOT_PASSWORD_PATH}/`)) {
    return true;
  }

  if (pathname === RESET_PASSWORD_PATH || pathname.startsWith(`${RESET_PASSWORD_PATH}/`)) {
    return true;
  }

  return false;
}

export function isAdminAuthPath(pathname: string) {
  return pathname === ADMIN_AUTH_PATH;
}

function buildAuthUrl(
  basePath: string,
  options?: { next?: string; expired?: boolean },
) {
  const params = new URLSearchParams();

  if (options?.next) {
    params.set("next", options.next);
  }

  if (options?.expired) {
    params.set("expired", "1");
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function buildMemberAuthUrl(options?: { next?: string; expired?: boolean }) {
  return buildAuthUrl(MEMBER_LOGIN_PATH, options);
}

export function buildAdminAuthUrl(options?: { next?: string; expired?: boolean }) {
  return buildAuthUrl(ADMIN_AUTH_PATH, options);
}

/** @deprecated Use buildMemberAuthUrl */
export function buildLoginUrl(options?: { next?: string; expired?: boolean }) {
  return buildMemberAuthUrl(options);
}

export function isAuthEntryPath(pathname: string) {
  return MEMBER_AUTH_ENTRY_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  ) || pathname === ADMIN_AUTH_PATH;
}
