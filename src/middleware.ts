import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, decodeAuthTokenPayload } from "@/lib/auth";
import { buildLoginUrl } from "@/lib/authSession";
import { isMemberProtectedPath } from "@/lib/memberRoutes";

function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isMemberProtectedPath(pathname) && !isAdminRoute(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? decodeAuthTokenPayload(token) : null;

  if (!payload) {
    const loginUrl = new URL(buildLoginUrl({ next: pathname }), request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute(pathname) && payload.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
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
    "/admin/:path*",
  ],
};
