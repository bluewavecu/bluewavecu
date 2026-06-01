import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

const legacyMemberRedirects = [
  "dashboard",
  "accounts",
  "transactions",
  "transfers",
  "bill-pay",
  "statements",
  "payees",
  "disputes",
  "cards",
  "notifications",
  "profile",
  "settings",
].map((segment) => ({
  source: `/${segment}`,
  destination: `/auth/${segment}`,
  permanent: true,
}));

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    formats: ["image/webp", "image/avif"],
  },
  async redirects() {
    return [
      { source: "/login", destination: "/auth/login", permanent: true },
      { source: "/register", destination: "/auth/register", permanent: true },
      { source: "/auth", destination: "/auth/login", permanent: false },
      { source: "/member/loans", destination: "/auth/loans", permanent: true },
      { source: "/member/support", destination: "/auth/support", permanent: true },
      { source: "/member/security", destination: "/auth/security", permanent: true },
      ...legacyMemberRedirects,
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
