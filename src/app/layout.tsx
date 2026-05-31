import type { Metadata, Viewport } from "next";
import { Playfair_Display } from "next/font/google";
import "@/styles/globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { CrawlerBlockHead } from "@/components/seo/CrawlerBlockHead";
import { getServerLocale } from "@/i18n/getLocale";
import { getLocaleDirection } from "@/i18n/config";
import { blockSearchIndexing } from "@/lib/siteMetadata";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  ...blockSearchIndexing,
  title: "Bluewave",
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
      <head>
        <CrawlerBlockHead />
      </head>
      <body className={`${playfair.variable} bg-background text-foreground antialiased`}>
        <ClientProviders initialLocale={locale}>{children}</ClientProviders>
      </body>
    </html>
  );
}
