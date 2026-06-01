import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  EMAIL_LOGO,
  EMAIL_LOGO_CONTENT_ID,
} from "@/lib/branding";
import { getSiteUrl } from "@/lib/siteUrl";

export type EmailLogoRenderMode = "hosted" | "inline-cid" | "preview";

export function getEmailLogoAssetPath() {
  return join(process.cwd(), "public", EMAIL_LOGO.src.replace(/^\//, ""));
}

export function readEmailLogoBuffer() {
  return readFileSync(getEmailLogoAssetPath());
}

export function getEmailLogoInlineAttachment() {
  const content = readEmailLogoBuffer();

  return {
    filename: EMAIL_LOGO.src.split("/").pop() ?? "email_icon.webp",
    content,
    contentId: EMAIL_LOGO_CONTENT_ID,
  };
}

export function getEmailLogoDataUri() {
  const content = readEmailLogoBuffer();
  return `data:image/webp;base64,${content.toString("base64")}`;
}

export function getHostedEmailLogoUrl(appUrl: string) {
  return `${appUrl.replace(/\/$/, "")}${EMAIL_LOGO.src}`;
}

export function getEmailLogoHtmlSrc(mode: EmailLogoRenderMode = "hosted", appUrl?: string) {
  if (mode === "preview") {
    return getEmailLogoDataUri();
  }

  if (mode === "inline-cid") {
    return `cid:${EMAIL_LOGO_CONTENT_ID}`;
  }

  return getHostedEmailLogoUrl(appUrl ?? getSiteUrl());
}
