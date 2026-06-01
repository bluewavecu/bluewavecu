import type { MetadataRoute } from "next";
import { GOOGLE_CRAWLER_AGENTS } from "@/lib/crawlerDefense";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", disallow: "/" },
      ...GOOGLE_CRAWLER_AGENTS.map((userAgent) => ({
        userAgent,
        disallow: "/" as const,
      })),
    ],
  };
}
