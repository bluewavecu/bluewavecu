import { readFileSync } from "node:fs";
import { join } from "node:path";
import { EMAIL_LOGO_CONTENT_ID } from "@/lib/branding";

export function getEmailLogoInlineAttachment() {
  const content = readFileSync(join(process.cwd(), "public", "images", "auth_logo.webp"));

  return {
    filename: "auth_logo.webp",
    content,
    contentId: EMAIL_LOGO_CONTENT_ID,
  };
}
