import type { Metadata, Viewport } from "next";
import { Playfair_Display } from "next/font/google";
import "@/styles/globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { getServerLocale } from "@/i18n/getLocale";
import { getLocaleDirection } from "@/i18n/config";
import { publicMarketingMetadata } from "@/lib/siteMetadata";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  ...publicMarketingMetadata,
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
        <ClientProviders initialLocale={locale}>{children}</ClientProviders>
      </body>
    </html>
  );
}
