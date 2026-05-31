import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, decodeAuthTokenPayload } from "@/lib/auth";
import {
  LEGACY_LOGIN_PATH,
  MEMBER_AUTH_PATH,
  REGISTER_PATH,
  buildAdminAuthUrl,
  buildMemberAuthUrl,
  isAdminAuthPath,
  isAdminPath,
  isMemberAuthPath,
} from "@/lib/authRoutes";
import { isMemberProtectedPath } from "@/lib/memberRoutes";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === LEGACY_LOGIN_PATH) {
    const url = request.nextUrl.clone();
    url.pathname = MEMBER_AUTH_PATH;
    return NextResponse.redirect(url);
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? decodeAuthTokenPayload(token) : null;

  if (isMemberAuthPath(pathname) || pathname === REGISTER_PATH) {
    if (payload?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (payload?.role === "USER") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  if (isAdminAuthPath(pathname)) {
    if (payload?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
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
    "/auth",
    "/register",
    "/lex/auth",
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
