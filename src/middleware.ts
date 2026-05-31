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
import { isMemberProtectedPath, MEMBER_DASHBOARD_PATH } from "@/lib/memberRoutes";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isLegacyAdminPath(pathname)) {
    return NextResponse.rewrite(new URL("/404", request.url));
  }

  if (pathname === LEGACY_LOGIN_PATH) {
    const url = request.nextUrl.clone();
    url.pathname = MEMBER_LOGIN_PATH;
    return NextResponse.redirect(url);
  }

  if (pathname === LEGACY_REGISTER_PATH) {
    const url = request.nextUrl.clone();
    url.pathname = MEMBER_REGISTER_PATH;
    return NextResponse.redirect(url);
  }

  if (pathname === MEMBER_BASE_PATH) {
    const url = request.nextUrl.clone();
    url.pathname = MEMBER_LOGIN_PATH;
    return NextResponse.redirect(url);
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? decodeAuthTokenPayload(token) : null;

  if (isMemberAuthPath(pathname)) {
    if (payload?.role === "ADMIN") {
      return NextResponse.redirect(new URL(ADMIN_DASHBOARD_PATH, request.url));
    }

    if (payload?.role === "USER") {
      return NextResponse.redirect(new URL(MEMBER_DASHBOARD_PATH, request.url));
    }

    return NextResponse.next();
  }

  if (isAdminAuthPath(pathname)) {
    if (payload?.role === "ADMIN") {
      return NextResponse.redirect(new URL(ADMIN_DASHBOARD_PATH, request.url));
    }

    if (payload?.role === "USER") {
      return NextResponse.rewrite(new URL("/404", request.url));
    }

    return NextResponse.next();
  }

  if (isAdminPath(pathname)) {
    if (!payload) {
      const loginUrl = new URL(buildAdminAuthUrl({ next: pathname }), request.url);
      return NextResponse.redirect(loginUrl);
    }

    if (payload.role !== "ADMIN") {
      return NextResponse.rewrite(new URL("/404", request.url));
    }

    return NextResponse.next();
  }

  if (isMemberProtectedPath(pathname)) {
    if (!payload) {
      const loginUrl = new URL(buildMemberAuthUrl({ next: pathname }), request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/auth",
    "/auth/:path*",
    "/lex/auth",
    "/lex/auth/:path*",
    "/admin",
    "/admin/:path*",
    "/dashboard/:path*",
    "/accounts/:path*",
    "/transactions/:path*",
    "/transfers/:path*",
    "/bill-pay/:path*",
    "/statements/:path*",
    "/payees/:path*",
    "/disputes/:path*",
    "/cards/:path*",
    "/notifications/:path*",
    "/settings/:path*",
    "/member/:path*",
    "/profile/:path*",
  ],
};
