import type { Metadata } from "next";

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
    },
  },
};

export function privatePageMetadata(title: string): Metadata {
  return {
    ...blockSearchIndexing,
    title,
  };
}
