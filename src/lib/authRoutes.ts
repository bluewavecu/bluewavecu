export const MEMBER_AUTH_PATH = "/auth";
export const ADMIN_AUTH_PATH = "/lex/auth";
export const REGISTER_PATH = "/register";
export const LEGACY_LOGIN_PATH = "/login";

const AUTH_ENTRY_PATHS = [MEMBER_AUTH_PATH, ADMIN_AUTH_PATH, LEGACY_LOGIN_PATH, REGISTER_PATH];

export function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isMemberAuthPath(pathname: string) {
  return pathname === MEMBER_AUTH_PATH;
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
  return buildAuthUrl(MEMBER_AUTH_PATH, options);
}

export function buildAdminAuthUrl(options?: { next?: string; expired?: boolean }) {
  return buildAuthUrl(ADMIN_AUTH_PATH, options);
}

/** @deprecated Use buildMemberAuthUrl */
export function buildLoginUrl(options?: { next?: string; expired?: boolean }) {
  return buildMemberAuthUrl(options);
}

export function isAuthEntryPath(pathname: string) {
  return AUTH_ENTRY_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}
