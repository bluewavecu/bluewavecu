const DEFAULT_SITE_URL = "https://bluewavecu.com";

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  return DEFAULT_SITE_URL;
}

export function getOfficialDomain() {
  try {
    return new URL(getSiteUrl()).hostname.replace(/^www\./, "");
  } catch {
    return "bluewavecu.com";
  }
}
