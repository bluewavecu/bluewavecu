/**
 * Central crawler-blocking policy. Keep Google and other indexers off the site
 * via robots, meta tags, response headers, and middleware user-agent rejection.
 */
export const CRAWLER_BLOCK_DIRECTIVE =
  "noindex, nofollow, noarchive, nosnippet, noimageindex, max-snippet:0, max-image-preview:none, max-video-preview:0";

export const GOOGLE_CRAWLER_AGENTS = [
  "Googlebot",
  "Googlebot-Image",
  "Googlebot-News",
  "Googlebot-Video",
  "Google-Extended",
  "Google-InspectionTool",
  "GoogleOther",
  "GoogleProducer",
  "Storebot-Google",
  "AdsBot-Google",
  "AdsBot-Google-Mobile",
  "Mediapartners-Google",
  "APIs-Google",
  "FeedFetcher-Google",
  "DuplexWeb-Google",
  "Google Favicon",
  "Google-Site-Verification",
  "Chrome-Lighthouse",
] as const;

const googleCrawlerPattern = new RegExp(
  GOOGLE_CRAWLER_AGENTS.map((agent) => agent.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
  "i",
);

export function isGoogleCrawlerUserAgent(userAgent: string | null | undefined) {
  if (!userAgent?.trim()) {
    return false;
  }

  return googleCrawlerPattern.test(userAgent);
}

export function crawlerBlockHeaders(): HeadersInit {
  return {
    "X-Robots-Tag": CRAWLER_BLOCK_DIRECTIVE,
    "Cache-Control": "private, no-store, no-cache, must-revalidate",
  };
}
