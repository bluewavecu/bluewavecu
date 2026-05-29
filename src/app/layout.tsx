import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/layout/Navbar";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Bluewave Credit Union",
  description:
    "Modern digital banking platform focused on secure finance and seamless online banking.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
