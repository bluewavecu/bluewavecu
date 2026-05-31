import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

const publicPaths = [
  "",
  "/about",
  "/personal",
  "/business",
  "/savings",
  "/loans",
  "/rates",
  "/support",
  "/security",
  "/contact",
  "/careers",
  "/newsroom",
  "/mobile-app",
  "/privacy",
  "/terms",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  return publicPaths.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
