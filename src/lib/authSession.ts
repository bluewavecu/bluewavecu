const SAFE_REDIRECT_PREFIXES = [
  "/dashboard",
  "/accounts",
  "/transactions",
  "/transfers",
  "/cards",
  "/loans",
  "/support",
  "/security",
  "/admin",
];

export function buildLoginUrl(options?: { next?: string; expired?: boolean }) {
  const params = new URLSearchParams();

  if (options?.next) {
    params.set("next", options.next);
  }

  if (options?.expired) {
    params.set("expired", "1");
  }

  const query = params.toString();
  return query ? `/login?${query}` : "/login";
}

export function getSafeRedirectPath(next: string | null | undefined, role?: "USER" | "ADMIN") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return role === "ADMIN" ? "/admin" : "/dashboard";
  }

  if (next.startsWith("/login") || next.startsWith("/register")) {
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
