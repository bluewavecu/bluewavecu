import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", disallow: "/" },
      { userAgent: "Googlebot", disallow: "/" },
      { userAgent: "Googlebot-Image", disallow: "/" },
      { userAgent: "Googlebot-News", disallow: "/" },
      { userAgent: "Googlebot-Video", disallow: "/" },
      { userAgent: "AdsBot-Google", disallow: "/" },
      { userAgent: "Mediapartners-Google", disallow: "/" },
    ],
  };
}
