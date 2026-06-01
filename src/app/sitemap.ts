import type { MetadataRoute } from "next";

/** Intentionally empty — no URLs should be submitted to search engines. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [];
}
