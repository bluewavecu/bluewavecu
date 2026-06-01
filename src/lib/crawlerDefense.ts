/**
 * Search-engine policy for bluewavecu.com.
 *
 * Public marketing pages may be indexed so Google Safe Browsing can verify the site.
 * Member banking, admin, and API routes stay out of the index.
 */

export const PRIVATE_NOINDEX_DIRECTIVE = "noindex, nofollow, noarchive, nosnippet";

/** Paths that must never appear in search results. */
export const NOINDEX_PATH_PREFIXES = [
  "/auth",
  "/lex",
  "/api",
  "/admin",
  "/dev",
  "/login",
  "/register",
] as const;

export function isNoindexPath(pathname: string) {
  return NOINDEX_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function privateNoindexHeaders(): HeadersInit {
  return {
    "X-Robots-Tag": PRIVATE_NOINDEX_DIRECTIVE,
    "Cache-Control": "private, no-store, no-cache, must-revalidate",
  };
}
