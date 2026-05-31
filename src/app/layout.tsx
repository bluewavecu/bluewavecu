import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { getServerLocale } from "@/i18n/getLocale";
import { getLocaleDirection } from "@/i18n/config";

export const metadata: Metadata = {
  title: "Bluewave Credit Union",
  description:
    "Member-owned credit union with secure online banking, competitive rates, and local service in Dallas.",
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
      <body className="bg-background text-foreground antialiased">
        <ClientProviders initialLocale={locale}>{children}</ClientProviders>
      </body>
    </html>
  );
}
