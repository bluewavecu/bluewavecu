import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, decodeAuthTokenPayload } from "@/lib/auth";
import {
  ADMIN_DASHBOARD_PATH,
  LEGACY_LOGIN_PATH,
  LEGACY_REGISTER_PATH,
  MEMBER_BASE_PATH,
  MEMBER_LOGIN_PATH,
  MEMBER_REGISTER_PATH,
  buildAdminAuthUrl,
  buildMemberAuthUrl,
  isAdminAuthPath,
  isAdminPath,
  isLegacyAdminPath,
  isMemberAuthPath,
} from "@/lib/authRoutes";
import { isNoindexPath, privateNoindexHeaders } from "@/lib/crawlerDefense";
import { isMemberProtectedPath, MEMBER_DASHBOARD_PATH } from "@/lib/memberRoutes";

function withPathPolicy(response: NextResponse, pathname: string) {
  if (isNoindexPath(pathname)) {
    for (const [key, value] of Object.entries(privateNoindexHeaders())) {
      response.headers.set(key, value);
    }
  }

  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isLegacyAdminPath(pathname)) {
    return withPathPolicy(NextResponse.rewrite(new URL("/404", request.url)), pathname);
  }

  if (pathname === LEGACY_LOGIN_PATH) {
    const url = request.nextUrl.clone();
    url.pathname = MEMBER_LOGIN_PATH;
    return withPathPolicy(NextResponse.redirect(url), pathname);
  }

  if (pathname === LEGACY_REGISTER_PATH) {
    const url = request.nextUrl.clone();
    url.pathname = MEMBER_REGISTER_PATH;
    return withPathPolicy(NextResponse.redirect(url), pathname);
  }

  if (pathname === MEMBER_BASE_PATH) {
    const url = request.nextUrl.clone();
    url.pathname = MEMBER_LOGIN_PATH;
    return withPathPolicy(NextResponse.redirect(url), pathname);
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? decodeAuthTokenPayload(token) : null;

  if (isMemberAuthPath(pathname)) {
    if (payload?.role === "ADMIN") {
      return withPathPolicy(
        NextResponse.redirect(new URL(ADMIN_DASHBOARD_PATH, request.url)),
        pathname,
      );
    }

    if (payload?.role === "USER") {
      return withPathPolicy(
        NextResponse.redirect(new URL(MEMBER_DASHBOARD_PATH, request.url)),
        pathname,
      );
    }

    return withPathPolicy(NextResponse.next(), pathname);
  }

  if (isAdminAuthPath(pathname)) {
    if (payload?.role === "ADMIN") {
      return withPathPolicy(
        NextResponse.redirect(new URL(ADMIN_DASHBOARD_PATH, request.url)),
        pathname,
      );
    }

    if (payload?.role === "USER") {
      return withPathPolicy(NextResponse.rewrite(new URL("/404", request.url)), pathname);
    }

    return withPathPolicy(NextResponse.next(), pathname);
  }

  if (isAdminPath(pathname)) {
    if (!payload) {
      const loginUrl = new URL(buildAdminAuthUrl({ next: pathname }), request.url);
      return withPathPolicy(NextResponse.redirect(loginUrl), pathname);
    }

    if (payload.role !== "ADMIN") {
      return withPathPolicy(NextResponse.rewrite(new URL("/404", request.url)), pathname);
    }

    return withPathPolicy(NextResponse.next(), pathname);
  }

  if (isMemberProtectedPath(pathname)) {
    if (!payload) {
      const loginUrl = new URL(buildMemberAuthUrl({ next: pathname }), request.url);
      return withPathPolicy(NextResponse.redirect(loginUrl), pathname);
    }

    return withPathPolicy(NextResponse.next(), pathname);
  }

  return withPathPolicy(NextResponse.next(), pathname);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|fonts/).*)"],
};
