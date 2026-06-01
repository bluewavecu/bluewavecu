import type { Metadata } from "next";
import { CRAWLER_BLOCK_DIRECTIVE } from "@/lib/crawlerDefense";

export const crawlerBlockMetaContent = CRAWLER_BLOCK_DIRECTIVE;

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
    googlebot: crawlerBlockMetaContent,
    "googlebot-news": crawlerBlockMetaContent,
    "googlebot-image": crawlerBlockMetaContent,
    "googlebot-video": crawlerBlockMetaContent,
    bingbot: crawlerBlockMetaContent,
    slurp: crawlerBlockMetaContent,
    duckduckbot: crawlerBlockMetaContent,
  },
};

export function privatePageMetadata(title: string): Metadata {
  return {
    ...blockSearchIndexing,
    title,
  };
}
