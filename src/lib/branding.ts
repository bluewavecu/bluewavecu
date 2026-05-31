import { INSTITUTION } from "@/lib/institution";

export { MEMBER_AUTH_PATH, MEMBER_LOGIN_PATH, ADMIN_AUTH_PATH } from "@/lib/authRoutes";

export const BRAND_LEGAL_NAME = INSTITUTION.legalName;
export const BRAND_SHORT_NAME = INSTITUTION.shortName;

/** Member-facing positioning — use on marketing and auth shells */
export const BRAND_TAGLINE =
  "Member-owned banking with secure online access and local service.";

/** Canonical site logo — `public/images/logo.webp` (transparent white mark) */
export const BRAND_LOGO = {
  src: "/images/logo.webp",
  width: 2172,
  height: 724,
  alt: BRAND_LEGAL_NAME,
} as const;

/** Default display height for header, footer, and app shells */
export const BRAND_LOGO_HEIGHT = 44;

/** Full-color logo for member auth, online banking, and enrollment — `public/images/auth_logo.webp` */
export const AUTH_LOGO = {
  src: "/images/auth_logo.webp",
  width: 930,
  height: 254,
  alt: BRAND_LEGAL_NAME,
} as const;

export const AUTH_LOGO_HEIGHT = 52;

/** Transactional email header — same full-color mark as auth screens */
export const EMAIL_LOGO = AUTH_LOGO;

/** Render width for the logo `<img>` in HTML email headers */
export const EMAIL_LOGO_DISPLAY_WIDTH = 220;

export function getEmailLogoDisplayDimensions(
  displayWidth: number = EMAIL_LOGO_DISPLAY_WIDTH,
  asset: { width: number; height: number } = EMAIL_LOGO,
) {
  return {
    width: displayWidth,
    height: Math.round((displayWidth * asset.height) / asset.width),
  };
}
