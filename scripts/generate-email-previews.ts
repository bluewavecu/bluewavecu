import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { getEmailPreviewDefinitions } from "../src/lib/emailPreviews";

const outputDir = resolve(process.cwd(), "email-previews");

mkdirSync(outputDir, { recursive: true });

const previews = getEmailPreviewDefinitions();

for (const preview of previews) {
  writeFileSync(resolve(outputDir, `${preview.id}.html`), preview.html, "utf8");
  writeFileSync(resolve(outputDir, `${preview.id}.txt`), preview.text, "utf8");
}

writeFileSync(
  resolve(outputDir, "index.html"),
  `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Bluewave Email Previews</title>
    <style>
      body { font-family: Arial, sans-serif; background: #E8EEF5; color: #0A2A5E; margin: 0; padding: 32px; }
      main { max-width: 960px; margin: 0 auto; }
      h1 { margin-bottom: 8px; }
      p { color: #475569; }
      ul { list-style: none; padding: 0; display: grid; gap: 12px; margin-top: 24px; }
      a { display: block; background: white; border: 1px solid #D7E2EE; border-radius: 12px; padding: 16px 18px; text-decoration: none; color: inherit; }
      a:hover { border-color: #00A8E8; }
      strong { display: block; margin-bottom: 4px; }
      span { color: #475569; font-size: 14px; }
    </style>
  </head>
  <body>
    <main>
      <h1>Bluewave transactional email previews</h1>
      <p>Generated locally for review before deploy. Open any template below.</p>
      <ul>
        ${previews
          .map(
            (preview) =>
              `<li><a href="./${preview.id}.html"><strong>${preview.name}</strong><span>${preview.subject}</span></a></li>`,
          )
          .join("")}
      </ul>
    </main>
  </body>
</html>`,
  "utf8",
);

console.log(`Generated ${previews.length} email previews in ${outputDir}`);
