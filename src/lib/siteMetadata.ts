import type { Metadata } from "next";
import { PRIVATE_NOINDEX_DIRECTIVE } from "@/lib/crawlerDefense";
import { BRAND_LEGAL_NAME, BRAND_SHORT_NAME, BRAND_TAGLINE } from "@/lib/branding";
import { INSTITUTION } from "@/lib/institution";
import { getSiteUrl } from "@/lib/siteUrl";

export const privateNoindexMetaContent = PRIVATE_NOINDEX_DIRECTIVE;

export const blockSearchIndexing: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },
};

export const publicMarketingMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${BRAND_SHORT_NAME} Credit Union | ${BRAND_TAGLINE}`,
    template: `%s | ${BRAND_SHORT_NAME} Credit Union`,
  },
  description: BRAND_TAGLINE,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    siteName: BRAND_LEGAL_NAME,
    title: BRAND_LEGAL_NAME,
    description: BRAND_TAGLINE,
  },
  alternates: {
    canonical: "/",
  },
  other: {
    contact: INSTITUTION.email,
  },
};

export function privatePageMetadata(title: string): Metadata {
  return {
    ...blockSearchIndexing,
    title,
  };
}
