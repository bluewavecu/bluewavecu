import type { Metadata, Viewport } from "next";
import { Playfair_Display } from "next/font/google";
import "@/styles/globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { InstitutionJsonLd } from "@/components/seo/InstitutionJsonLd";
import { getServerLocale } from "@/i18n/getLocale";
import { getLocaleDirection } from "@/i18n/config";
import { getSiteUrl } from "@/lib/siteUrl";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bluewave Credit Union",
    template: "%s | Bluewave Credit Union",
  },
  description:
    "Member-owned credit union with secure online banking, competitive rates, and local service in Dallas.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Bluewave Credit Union",
    title: "Bluewave Credit Union",
    description:
      "Member-owned credit union with secure online banking, competitive rates, and local service in Dallas.",
    images: [{ url: "/images/auth_logo.webp", width: 512, height: 512, alt: "Bluewave Credit Union" }],
  },
  icons: {
    icon: [{ url: "/images/icon.webp", type: "image/webp" }],
    apple: [{ url: "/images/icon.webp", type: "image/webp" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A2A5E",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();

  return (
    <html lang={locale} dir={getLocaleDirection(locale)}>
      <body className={`${playfair.variable} bg-background text-foreground antialiased`}>
        <InstitutionJsonLd />
        <ClientProviders initialLocale={locale}>{children}</ClientProviders>
      </body>
    </html>
  );
}
