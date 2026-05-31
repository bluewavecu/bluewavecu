import type { Metadata } from "next";

const crawlerDirective =
  "noindex, nofollow, noarchive, nosnippet, noimageindex, max-snippet:0, max-image-preview:none, max-video-preview:0";

export const blockSearchIndexing: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      noarchive: true,
      nosnippet: true,
      "max-snippet": 0,
      "max-image-preview": "none",
      "max-video-preview": 0,
    },
  },
  other: {
    googlebot: crawlerDirective,
    "googlebot-news": crawlerDirective,
    "googlebot-image": crawlerDirective,
    "googlebot-video": crawlerDirective,
  },
};

export function privatePageMetadata(title: string): Metadata {
  return {
    ...blockSearchIndexing,
    title,
  };
}

export const crawlerBlockMetaContent = crawlerDirective;
