import { INSTITUTION } from "@/lib/institution";

export { MEMBER_AUTH_PATH, MEMBER_LOGIN_PATH, ADMIN_AUTH_PATH } from "@/lib/authRoutes";

export const BRAND_LEGAL_NAME = INSTITUTION.legalName;
export const BRAND_SHORT_NAME = INSTITUTION.shortName;

/** Member-facing positioning — use on marketing and auth shells */
export const BRAND_TAGLINE =
  "Member-owned digital banking with secure transfers and clear account controls.";

/** Canonical site logo */
export const BRAND_LOGO = {
  src: "/images/logo.webp",
  width: 2172,
  height: 724,
  alt: BRAND_LEGAL_NAME,
} as const;

export const BRAND_LOGO_HEIGHT = 44;

export const AUTH_LOGO = {
  src: "/images/auth_logo.webp",
  width: 930,
  height: 254,
  alt: BRAND_LEGAL_NAME,
} as const;

export const AUTH_LOGO_HEIGHT = 52;

export const EMAIL_LOGO = AUTH_LOGO;

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

export const EMAIL_LOGO_CONTENT_ID = "bluewave-email-logo";
