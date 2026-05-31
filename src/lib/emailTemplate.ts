import {
  EMAIL_LOGO,
  getEmailLogoDisplayDimensions,
} from "@/lib/branding";
import { readEnv } from "@/lib/databaseEnv";
import { tryGetServerEnv } from "@/lib/env";
import { INSTITUTION, formatInstitutionAddress } from "@/lib/institution";

export type EmailLayoutOptions = {
  title: string;
  preheader?: string;
  bodyHtml: string;
  appUrl?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  securityNotice?: string;
};

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function getEmailAppUrl() {
  return (
    tryGetServerEnv()?.NEXT_PUBLIC_APP_URL ??
    readEnv("NEXT_PUBLIC_APP_URL") ??
    "http://localhost:3000"
  );
}

export function getEmailLogoUrl(appUrl = getEmailAppUrl()) {
  return `${appUrl.replace(/\/$/, "")}${EMAIL_LOGO.src}`;
}

function buildPrimaryActionButton(action: EmailLayoutOptions["primaryAction"], appUrl: string) {
  if (!action) {
    return "";
  }

  const href = action.href.startsWith("http") ? action.href : `${appUrl}${action.href}`;

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0 8px;">
      <tr>
        <td align="center" bgcolor="#00A8E8" style="border-radius: 999px;">
          <a href="${escapeHtml(href)}" style="display: inline-block; padding: 14px 28px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 700; color: #0A2A5E; text-decoration: none;">
            ${escapeHtml(action.label)}
          </a>
        </td>
      </tr>
    </table>`;
}

function buildSecurityNotice(notice: string | undefined) {
  if (!notice) {
    return "";
  }

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px;">
      <tr>
        <td style="padding: 16px 18px; background-color: #EEF6FF; border: 1px solid #C7DCF5; border-radius: 12px; font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 1.6; color: #0A2A5E;">
          <strong style="display: block; margin-bottom: 6px;">Security reminder</strong>
          ${escapeHtml(notice)}
        </td>
      </tr>
    </table>`;
}

export function buildEmailPlainTextFooter(appUrl = getEmailAppUrl()) {
  const lines = [
    INSTITUTION.legalName,
    formatInstitutionAddress(),
    `Member services: ${INSTITUTION.phone.display}`,
    `Email: ${INSTITUTION.email}`,
    `Hours: ${INSTITUTION.memberServicesHours}`,
    `Routing number: ${INSTITUTION.routingNumber}`,
    "",
    INSTITUTION.ncuaDisclaimer,
    "",
    "Questions about this message? Reply to this email or contact member services — we're here to help.",
    `Privacy: ${appUrl}/privacy | Terms: ${appUrl}/terms | Support: ${appUrl}/support`,
    `© ${new Date().getFullYear()} ${INSTITUTION.legalName}. All rights reserved.`,
  ];

  return lines.join("\n");
}

export function buildEmailLayout(options: EmailLayoutOptions) {
  const appUrl = (options.appUrl ?? getEmailAppUrl()).replace(/\/$/, "");
  const logoUrl = getEmailLogoUrl(appUrl);
  const { width: logoWidth, height: logoHeight } = getEmailLogoDisplayDimensions();
  const preheader = options.preheader ?? options.title;
  const address = formatInstitutionAddress();
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light" />
    <title>${escapeHtml(options.title)}</title>
    <style type="text/css">
      :root { color-scheme: light only; supported-color-schemes: light; }
      @media (prefers-color-scheme: dark) {
        .email-body,
        .email-body p,
        .email-body div,
        .email-body h1 {
          background-color: #FFFFFF !important;
          color: #334155 !important;
        }
        .email-body h1 {
          color: #0A2A5E !important;
        }
      }
    </style>
    <!--[if mso]>
      <style type="text/css">
        body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
      </style>
    <![endif]-->
  </head>
  <body style="margin: 0; padding: 0; background-color: #E8EEF5; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent; mso-hide: all;">
      ${escapeHtml(preheader)}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #E8EEF5; padding: 24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; width: 100%;">
            <tr>
              <td style="padding: 28px 32px 22px; background-color: #FFFFFF; border: 1px solid #D7E2EE; border-bottom: none; border-radius: 16px 16px 0 0; text-align: center;">
                <a href="${escapeHtml(appUrl)}" style="text-decoration: none;">
                  <img src="${escapeHtml(logoUrl)}" width="${logoWidth}" height="${logoHeight}" alt="${escapeHtml(INSTITUTION.legalName)}" style="display: block; margin: 0 auto; border: 0; outline: none; text-decoration: none; max-width: ${logoWidth}px; height: auto;" />
                </a>
              </td>
            </tr>
            <tr>
              <td style="height: 4px; background: linear-gradient(90deg, #0A2A5E 0%, #0D47A1 45%, #00A8E8 100%); font-size: 0; line-height: 0;">&nbsp;</td>
            </tr>
            <tr>
              <td class="email-body" style="padding: 32px 32px 28px; background-color: #FFFFFF !important; border-left: 1px solid #D7E2EE; border-right: 1px solid #D7E2EE; font-family: Arial, Helvetica, sans-serif; color: #0A2A5E !important;">
                <h1 style="margin: 0 0 18px; font-size: 24px; line-height: 1.3; font-weight: 700; color: #0A2A5E !important;">
                  ${escapeHtml(options.title)}
                </h1>
                <div style="font-size: 15px; line-height: 1.7; color: #334155 !important;">
                  ${options.bodyHtml}
                </div>
                ${buildPrimaryActionButton(options.primaryAction, appUrl)}
                ${buildSecurityNotice(options.securityNotice)}
              </td>
            </tr>
            <tr>
              <td style="padding: 28px 32px 32px; background-color: #0A2A5E; border: 1px solid #0A2A5E; border-top: none; border-radius: 0 0 16px 16px; font-family: Arial, Helvetica, sans-serif; color: #FFFFFF;">
                <p style="margin: 0 0 12px; font-size: 15px; font-weight: 700; color: #FFFFFF;">
                  ${escapeHtml(INSTITUTION.legalName)}
                </p>
                <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.6; color: rgba(255,255,255,0.82);">
                  ${escapeHtml(address)}
                </p>
                <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.6; color: rgba(255,255,255,0.82);">
                  Member services: <a href="tel:${escapeHtml(INSTITUTION.phone.tel)}" style="color: #8FD6FF; text-decoration: none;">${escapeHtml(INSTITUTION.phone.display)}</a>
                  &nbsp;·&nbsp;
                  <a href="mailto:${escapeHtml(INSTITUTION.email)}" style="color: #8FD6FF; text-decoration: none;">${escapeHtml(INSTITUTION.email)}</a>
                </p>
                <p style="margin: 0 0 16px; font-size: 13px; line-height: 1.6; color: rgba(255,255,255,0.72);">
                  ${escapeHtml(INSTITUTION.memberServicesHoursShort)} · Routing ${escapeHtml(INSTITUTION.routingNumber)}
                </p>
                <p style="margin: 0 0 16px; font-size: 12px; line-height: 1.6; color: rgba(255,255,255,0.68);">
                  ${escapeHtml(INSTITUTION.ncuaDisclaimer)}
                </p>
                <p style="margin: 0 0 16px; font-size: 12px; line-height: 1.6; color: rgba(255,255,255,0.68);">
                  Fraud prevention: ${escapeHtml(INSTITUTION.shortName)} will never ask for your password, one-time codes, or full card numbers by email. If you did not initiate this activity, contact member services immediately.
                </p>
                <p style="margin: 0 0 16px; font-size: 12px; line-height: 1.6; color: rgba(255,255,255,0.68);">
                  Questions about this message? Reply to this email or contact member services — we're here to help.
                </p>
                <p style="margin: 0; font-size: 12px; line-height: 1.6; color: rgba(255,255,255,0.72);">
                  <a href="${escapeHtml(appUrl)}/privacy" style="color: #8FD6FF; text-decoration: none;">Privacy</a>
                  &nbsp;·&nbsp;
                  <a href="${escapeHtml(appUrl)}/terms" style="color: #8FD6FF; text-decoration: none;">Terms</a>
                  &nbsp;·&nbsp;
                  <a href="${escapeHtml(appUrl)}/support" style="color: #8FD6FF; text-decoration: none;">Support</a>
                </p>
                <p style="margin: 16px 0 0; font-size: 11px; line-height: 1.5; color: rgba(255,255,255,0.55);">
                  © ${year} ${escapeHtml(INSTITUTION.legalName)}. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export type EmailDetailRow = {
  label: string;
  value: string;
};

export function buildEmailDetailsBlock(rows: EmailDetailRow[]) {
  const rowsHtml = rows
    .map(
      (row, index) => `
      <tr>
        <td style="padding: 10px 16px; font-family: Arial, Helvetica, sans-serif; font-size: 12px; font-weight: 700; color: #5A7394; background-color: #F7FBFF; border-bottom: 1px solid #E4EDF7; width: 140px; vertical-align: top;${index === rows.length - 1 ? " border-bottom: none;" : ""}">
          ${escapeHtml(row.label)}
        </td>
        <td style="padding: 10px 16px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #0A2A5E; border-bottom: 1px solid #E4EDF7; white-space: pre-wrap;${index === rows.length - 1 ? " border-bottom: none;" : ""}">
          ${escapeHtml(row.value)}
        </td>
      </tr>`,
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0; border: 1px solid #C7DCF5; border-radius: 12px; overflow: hidden; border-collapse: separate;">
      ${rowsHtml}
    </table>`;
}

export function buildEmailDetailsPlainText(rows: EmailDetailRow[]) {
  return rows.map((row) => `${row.label}: ${row.value}`).join("\n");
}

export function buildEmailText(title: string, body: string, appUrl = getEmailAppUrl()) {
  return `${title}\n\n${body}\n\n---\n${buildEmailPlainTextFooter(appUrl)}`;
}

export function formatEmailCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Math.abs(amount));
}
