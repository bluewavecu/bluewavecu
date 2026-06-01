import type { MetadataRoute } from "next";
import { NOINDEX_PATH_PREFIXES } from "@/lib/crawlerDefense";
import { getSiteUrl } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  const disallow = [
    ...NOINDEX_PATH_PREFIXES.map((prefix) =>
      prefix.endsWith("/") ? prefix : `${prefix}/`,
    ),
    "/login",
    "/register",
  ];

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
