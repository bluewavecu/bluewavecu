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
import {
  crawlerBlockHeaders,
  isGoogleCrawlerUserAgent,
} from "@/lib/crawlerDefense";
import { isMemberProtectedPath, MEMBER_DASHBOARD_PATH } from "@/lib/memberRoutes";
import { crawlerBlockMetaContent } from "@/lib/siteMetadata";

function withCrawlerBlock(response: NextResponse) {
  response.headers.set("X-Robots-Tag", crawlerBlockMetaContent);
  response.headers.set("Cache-Control", "private, no-store, no-cache, must-revalidate");
  return response;
}

function blockGoogleCrawler(request: NextRequest) {
  if (!isGoogleCrawlerUserAgent(request.headers.get("user-agent"))) {
    return null;
  }

  return new NextResponse("Forbidden", {
    status: 403,
    headers: crawlerBlockHeaders(),
  });
}

export function middleware(request: NextRequest) {
  const googleBlock = blockGoogleCrawler(request);
  if (googleBlock) {
    return googleBlock;
  }

  const { pathname } = request.nextUrl;

  if (isLegacyAdminPath(pathname)) {
    return withCrawlerBlock(NextResponse.rewrite(new URL("/404", request.url)));
  }

  if (pathname === LEGACY_LOGIN_PATH) {
    const url = request.nextUrl.clone();
    url.pathname = MEMBER_LOGIN_PATH;
    return withCrawlerBlock(NextResponse.redirect(url));
  }

  if (pathname === LEGACY_REGISTER_PATH) {
    const url = request.nextUrl.clone();
    url.pathname = MEMBER_REGISTER_PATH;
    return withCrawlerBlock(NextResponse.redirect(url));
  }

  if (pathname === MEMBER_BASE_PATH) {
    const url = request.nextUrl.clone();
    url.pathname = MEMBER_LOGIN_PATH;
    return withCrawlerBlock(NextResponse.redirect(url));
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? decodeAuthTokenPayload(token) : null;

  if (isMemberAuthPath(pathname)) {
    if (payload?.role === "ADMIN") {
      return withCrawlerBlock(NextResponse.redirect(new URL(ADMIN_DASHBOARD_PATH, request.url)));
    }

    if (payload?.role === "USER") {
      return withCrawlerBlock(NextResponse.redirect(new URL(MEMBER_DASHBOARD_PATH, request.url)));
    }

    return withCrawlerBlock(NextResponse.next());
  }

  if (isAdminAuthPath(pathname)) {
    if (payload?.role === "ADMIN") {
      return withCrawlerBlock(NextResponse.redirect(new URL(ADMIN_DASHBOARD_PATH, request.url)));
    }

    if (payload?.role === "USER") {
      return withCrawlerBlock(NextResponse.rewrite(new URL("/404", request.url)));
    }

    return withCrawlerBlock(NextResponse.next());
  }

  if (isAdminPath(pathname)) {
    if (!payload) {
      const loginUrl = new URL(buildAdminAuthUrl({ next: pathname }), request.url);
      return withCrawlerBlock(NextResponse.redirect(loginUrl));
    }

    if (payload.role !== "ADMIN") {
      return withCrawlerBlock(NextResponse.rewrite(new URL("/404", request.url)));
    }

    return withCrawlerBlock(NextResponse.next());
  }

  if (isMemberProtectedPath(pathname)) {
    if (!payload) {
      const loginUrl = new URL(buildMemberAuthUrl({ next: pathname }), request.url);
      return withCrawlerBlock(NextResponse.redirect(loginUrl));
    }

    return withCrawlerBlock(NextResponse.next());
  }

  return withCrawlerBlock(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|fonts/).*)",
  ],
};
