import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  EMAIL_LOGO,
  EMAIL_LOGO_CONTENT_ID,
} from "@/lib/branding";

export type EmailLogoRenderMode = "inline-cid" | "preview";

export function getEmailLogoAssetPath() {
  return join(process.cwd(), "public", EMAIL_LOGO.src.replace(/^\//, ""));
}

export function readEmailLogoBuffer() {
  return readFileSync(getEmailLogoAssetPath());
}

export function getEmailLogoInlineAttachment() {
  const content = readEmailLogoBuffer();

  return {
    filename: EMAIL_LOGO.src.split("/").pop() ?? "auth_logo.webp",
    content,
    contentId: EMAIL_LOGO_CONTENT_ID,
  };
}

export function getEmailLogoDataUri() {
  const content = readEmailLogoBuffer();
  return `data:image/webp;base64,${content.toString("base64")}`;
}

export function getEmailLogoHtmlSrc(mode: EmailLogoRenderMode = "inline-cid") {
  if (mode === "preview") {
    return getEmailLogoDataUri();
  }

  return `cid:${EMAIL_LOGO_CONTENT_ID}`;
}
