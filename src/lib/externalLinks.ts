/**
 * Allowlist for outbound links on public marketing pages.
 * Prevents accidental or compromised links to flagged domains.
 */

const ALLOWED_EXTERNAL_HOSTS = new Set([
  "mapping.ncua.gov",
  "www.ncua.gov",
  "ncua.gov",
]);

export function isAllowedExternalUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.protocol !== "https:") {
      return false;
    }

    return ALLOWED_EXTERNAL_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

export function getAllowedExternalUrl(url: string) {
  return isAllowedExternalUrl(url) ? url : null;
}
