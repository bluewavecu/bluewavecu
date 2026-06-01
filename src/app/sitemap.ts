import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

const PUBLIC_PATHS = [
  "",
  "/personal",
  "/business",
  "/savings",
  "/loans",
  "/rates",
  "/about",
  "/careers",
  "/newsroom",
  "/contact",
  "/support",
  "/security",
  "/mobile-app",
  "/privacy",
  "/terms",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const lastModified = new Date();

  return PUBLIC_PATHS.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
