import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { getEmailLogoAssetPath, getEmailLogoDataUri, getEmailLogoInlineAttachment } from "../src/lib/emailBranding";
import { buildEmailLayout } from "../src/lib/emailTemplate";

const outputDir = resolve(process.cwd(), "email-previews");

function extractLogoSrc(html: string) {
  const match = html.match(/<img[^>]+src="([^"]+)"/i);
  return match?.[1] ?? "";
}

function buildSampleLayout(title: string, bodyHtml: string) {
  return buildEmailLayout({
    title,
    bodyHtml,
    appUrl: "https://bluewavecu.com",
    logoMode: "preview",
  });
}

const memberHtml = buildSampleLayout(
  "Verify your email",
  "<p>Member verification email body.</p>",
);

const adminHtml = buildSampleLayout(
  "New membership application",
  "<p>Operations admin alert body.</p>",
);

const memberLogoSrc = extractLogoSrc(memberHtml);
const adminLogoSrc = extractLogoSrc(adminHtml);
const expectedDataUri = getEmailLogoDataUri();
const attachment = getEmailLogoInlineAttachment();

const checks = [
  {
    name: "Logo asset exists on disk",
    pass: existsSync(getEmailLogoAssetPath()),
  },
  {
    name: "Inline attachment uses shared content id",
    pass: attachment.contentId === "bluewave-email-logo",
  },
  {
    name: "Member email header embeds auth logo",
    pass: memberLogoSrc === expectedDataUri,
  },
  {
    name: "Admin email header uses the same logo src",
    pass: adminLogoSrc === memberLogoSrc && adminLogoSrc.length > 0,
  },
  {
    name: "Sent emails reference cid logo (not broken preview cid)",
    pass: buildEmailLayout({
      title: "Sent email",
      bodyHtml: "<p>Body</p>",
      logoMode: "inline-cid",
    }).includes('src="cid:bluewave-email-logo"'),
  },
];

mkdirSync(outputDir, { recursive: true });

writeFileSync(
  resolve(outputDir, "logo-comparison.html"),
  `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Bluewave email logo comparison</title>
    <style>
      body { font-family: Arial, sans-serif; background: #E8EEF5; color: #0A2A5E; margin: 0; padding: 24px; }
      h1 { margin: 0 0 8px; }
      p { color: #475569; }
      .grid { display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); margin-top: 24px; }
      section { background: white; border: 1px solid #D7E2EE; border-radius: 16px; overflow: hidden; }
      header { padding: 16px 20px; border-bottom: 1px solid #D7E2EE; font-weight: 700; }
      iframe { width: 100%; height: 520px; border: 0; background: #E8EEF5; }
      .ok { color: #047857; font-weight: 700; }
      .fail { color: #B91C1C; font-weight: 700; }
      ul { padding-left: 20px; }
    </style>
  </head>
  <body>
    <h1>Email logo parity check</h1>
    <p>Member and admin transactional emails share <code>/images/auth_logo.webp</code> in the header.</p>
    <ul>
      ${checks
        .map((check) => `<li class="${check.pass ? "ok" : "fail"}">${check.pass ? "PASS" : "FAIL"} — ${check.name}</li>`)
        .join("")}
    </ul>
    <div class="grid">
      <section>
        <header>Member verification email</header>
        <iframe title="Member email preview" srcdoc="${memberHtml.replaceAll('"', "&quot;")}"></iframe>
      </section>
      <section>
        <header>Admin membership alert</header>
        <iframe title="Admin email preview" srcdoc="${adminHtml.replaceAll('"', "&quot;")}"></iframe>
      </section>
    </div>
  </body>
</html>`,
  "utf8",
);

const failed = checks.filter((check) => !check.pass);

for (const check of checks) {
  console.log(`${check.pass ? "PASS" : "FAIL"} ${check.name}`);
}

console.log(`\nWrote ${resolve(outputDir, "logo-comparison.html")}`);

if (failed.length > 0) {
  process.exitCode = 1;
}
