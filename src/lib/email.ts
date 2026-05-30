import { Resend } from "resend";
import { getServerEnv } from "@/lib/env";

const DEFAULT_EMAIL_FROM = "Bluewave Credit Union <no-reply@bluewavecu.com>";

export type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  idempotencyKey?: string;
};

export type EmailConfig = {
  resendApiKey: string | null;
  emailFrom: string;
  adminAlertEmail: string | null;
  isProduction: boolean;
};

let cachedEmailConfig: EmailConfig | null = null;

export function getEmailConfig(): EmailConfig {
  if (cachedEmailConfig) {
    return cachedEmailConfig;
  }

  const { NODE_ENV } = getServerEnv();
  const resendApiKey = process.env.RESEND_API_KEY?.trim() || null;
  const emailFrom = process.env.EMAIL_FROM?.trim() || DEFAULT_EMAIL_FROM;
  const adminAlertEmail = process.env.ADMIN_ALERT_EMAIL?.trim() || null;
  const isProduction = NODE_ENV === "production";

  if (isProduction && !resendApiKey) {
    throw new Error("Environment validation failed:\n- RESEND_API_KEY: required in production");
  }

  cachedEmailConfig = {
    resendApiKey,
    emailFrom,
    adminAlertEmail,
    isProduction,
  };

  return cachedEmailConfig;
}

function logEmailPayload(payload: EmailPayload, reason: string) {
  console.info("[email:dev-log]", reason, {
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    htmlPreview: payload.html.slice(0, 240),
    idempotencyKey: payload.idempotencyKey,
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildEmailHtml(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #0A2A5E;">
    <div style="max-width: 560px; margin: 0 auto; padding: 24px;">
      <h1 style="font-size: 20px; margin-bottom: 16px;">${escapeHtml(title)}</h1>
      ${body}
      <p style="margin-top: 24px; font-size: 12px; color: #6B7280;">
        Bluewave Credit Union — secure digital banking notifications.
      </p>
    </div>
  </body>
</html>`;
}

export async function sendEmail(payload: EmailPayload) {
  const config = getEmailConfig();

  if (!config.resendApiKey) {
    logEmailPayload(payload, "RESEND_API_KEY missing — logged instead of sent");
    return { ok: true as const, mode: "logged" as const };
  }

  const resend = new Resend(config.resendApiKey);
  const requestOptions = payload.idempotencyKey
    ? { idempotencyKey: payload.idempotencyKey }
    : undefined;

  const { data, error } = await resend.emails.send(
    {
      from: config.emailFrom,
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    },
    requestOptions,
  );

  if (error) {
    console.error("[email] Failed to send:", error.message, {
      subject: payload.subject,
      to: payload.to,
    });
    return { ok: false as const, mode: "sent" as const, error: error.message };
  }

  return { ok: true as const, mode: "sent" as const, id: data?.id };
}

export async function safeSendEmail(payload: EmailPayload, context: string) {
  try {
    return await sendEmail(payload);
  } catch (error) {
    console.error(`[email] ${context} failed:`, error);
    return { ok: false as const, mode: "error" as const };
  }
}

export async function sendWelcomeEmail(params: {
  email: string;
  fullName: string;
  userId: string;
}) {
  const appUrl = getServerEnv().NEXT_PUBLIC_APP_URL;

  return safeSendEmail(
    {
      to: params.email,
      subject: "Welcome to Bluewave Credit Union",
      text: `Hi ${params.fullName}, welcome to Bluewave Credit Union. Your account is pending review.`,
      html: buildEmailHtml(
        "Welcome to Bluewave",
        `<p>Hi ${escapeHtml(params.fullName)},</p>
         <p>Thanks for registering with Bluewave Credit Union. Your membership request has been received and is pending review.</p>
         <p><a href="${escapeHtml(appUrl)}/dashboard">View your dashboard</a></p>`,
      ),
      idempotencyKey: `welcome-email/${params.userId}`,
    },
    "sendWelcomeEmail",
  );
}

export async function sendLoginAlertEmail(params: {
  email: string;
  fullName: string;
  userId: string;
  loginAt?: Date;
}) {
  const loginAt = params.loginAt ?? new Date();
  const formattedTime = loginAt.toISOString();

  return safeSendEmail(
    {
      to: params.email,
      subject: "New sign-in to your Bluewave account",
      text: `Hi ${params.fullName}, a new sign-in to your Bluewave account was detected at ${formattedTime}.`,
      html: buildEmailHtml(
        "Sign-in alert",
        `<p>Hi ${escapeHtml(params.fullName)},</p>
         <p>A new sign-in to your Bluewave account was detected at <strong>${escapeHtml(formattedTime)}</strong>.</p>
         <p>If this wasn't you, contact support immediately.</p>`,
      ),
      idempotencyKey: `login-alert/${params.userId}/${formattedTime.slice(0, 16)}`,
    },
    "sendLoginAlertEmail",
  );
}

export async function sendTransferCreatedEmail(params: {
  email: string;
  fullName: string;
  amount: number;
  reference: string;
  description: string;
}) {
  return safeSendEmail(
    {
      to: params.email,
      subject: "Transfer request submitted for review",
      text: `Hi ${params.fullName}, your transfer request for $${Math.abs(params.amount).toFixed(2)} (${params.reference}) is pending review.`,
      html: buildEmailHtml(
        "Transfer request submitted",
        `<p>Hi ${escapeHtml(params.fullName)},</p>
         <p>Your transfer request for <strong>$${Math.abs(params.amount).toFixed(2)}</strong> has been submitted and is pending review.</p>
         <p><strong>Reference:</strong> ${escapeHtml(params.reference)}</p>
         <p><strong>Details:</strong> ${escapeHtml(params.description)}</p>
         <p>Account balances remain unchanged until the request is reviewed.</p>`,
      ),
      idempotencyKey: `transfer-created/${params.reference}`,
    },
    "sendTransferCreatedEmail",
  );
}

export async function sendTransferStatusEmail(params: {
  email: string;
  fullName: string;
  amount: number;
  reference: string;
  description: string;
  status: "COMPLETED" | "FAILED" | "REVERSED";
}) {
  const statusLabel =
    params.status === "COMPLETED"
      ? "approved"
      : params.status === "FAILED"
        ? "declined"
        : "reversed";

  const balanceMessage =
    params.status === "COMPLETED"
      ? "Balances have been updated after ledger posting."
      : "Account balances were not changed.";

  return safeSendEmail(
    {
      to: params.email,
      subject: `Transfer request ${statusLabel}`,
      text: `Hi ${params.fullName}, your transfer ${params.reference} was ${statusLabel}. ${balanceMessage}`,
      html: buildEmailHtml(
        `Transfer request ${statusLabel}`,
        `<p>Hi ${escapeHtml(params.fullName)},</p>
         <p>Your transfer request <strong>${escapeHtml(params.reference)}</strong> for <strong>$${Math.abs(params.amount).toFixed(2)}</strong> has been <strong>${statusLabel}</strong>.</p>
         <p><strong>Details:</strong> ${escapeHtml(params.description)}</p>
         <p>${balanceMessage}</p>`,
      ),
      idempotencyKey: `transfer-status/${params.reference}/${params.status}`,
    },
    "sendTransferStatusEmail",
  );
}

export async function sendSupportTicketCreatedEmail(params: {
  email: string;
  fullName: string;
  ticketId: string;
  subject: string;
}) {
  return safeSendEmail(
    {
      to: params.email,
      subject: "Support ticket received",
      text: `Hi ${params.fullName}, we received your support ticket: ${params.subject}`,
      html: buildEmailHtml(
        "Support ticket received",
        `<p>Hi ${escapeHtml(params.fullName)},</p>
         <p>We received your support ticket and our team will review it shortly.</p>
         <p><strong>Subject:</strong> ${escapeHtml(params.subject)}</p>
         <p><strong>Ticket ID:</strong> ${escapeHtml(params.ticketId)}</p>`,
      ),
      idempotencyKey: `support-created/${params.ticketId}`,
    },
    "sendSupportTicketCreatedEmail",
  );
}

export async function sendSupportTicketUpdatedEmail(params: {
  email: string;
  fullName: string;
  ticketId: string;
  subject: string;
  status: string;
}) {
  const statusLabel =
    params.status === "PENDING"
      ? "In Progress"
      : params.status.charAt(0) + params.status.slice(1).toLowerCase();

  return safeSendEmail(
    {
      to: params.email,
      subject: "Support ticket update",
      text: `Hi ${params.fullName}, your support ticket "${params.subject}" is now ${statusLabel}.`,
      html: buildEmailHtml(
        "Support ticket updated",
        `<p>Hi ${escapeHtml(params.fullName)},</p>
         <p>Your support ticket has been updated.</p>
         <p><strong>Subject:</strong> ${escapeHtml(params.subject)}</p>
         <p><strong>Status:</strong> ${escapeHtml(statusLabel)}</p>
         <p><strong>Ticket ID:</strong> ${escapeHtml(params.ticketId)}</p>`,
      ),
      idempotencyKey: `support-updated/${params.ticketId}/${params.status}`,
    },
    "sendSupportTicketUpdatedEmail",
  );
}

export async function sendAdminAlertEmail(params: {
  subject: string;
  message: string;
  idempotencyKey: string;
}) {
  const config = getEmailConfig();

  if (!config.adminAlertEmail) {
    logEmailPayload(
      {
        to: "admin-alert-disabled",
        subject: params.subject,
        html: params.message,
        text: params.message,
        idempotencyKey: params.idempotencyKey,
      },
      "ADMIN_ALERT_EMAIL missing — logged instead of sent",
    );
    return { ok: true as const, mode: "logged" as const };
  }

  return safeSendEmail(
    {
      to: config.adminAlertEmail,
      subject: `[Bluewave Admin] ${params.subject}`,
      text: params.message,
      html: buildEmailHtml(params.subject, `<p>${escapeHtml(params.message)}</p>`),
      idempotencyKey: params.idempotencyKey,
    },
    "sendAdminAlertEmail",
  );
}

export async function sendPayeeAddedEmail(params: {
  email: string;
  fullName: string;
  payeeName: string;
}) {
  return safeSendEmail(
    {
      to: params.email,
      subject: "Payee added to your account",
      text: `Hi ${params.fullName}, ${params.payeeName} was added to your payee list.`,
      html: buildEmailHtml(
        "Payee added",
        `<p>Hi ${escapeHtml(params.fullName)},</p>
         <p><strong>${escapeHtml(params.payeeName)}</strong> was added to your Bluewave payee list.</p>`,
      ),
      idempotencyKey: `payee-added/${params.email}/${params.payeeName}`,
    },
    "sendPayeeAddedEmail",
  );
}

export async function sendBillPaymentCreatedEmail(params: {
  email: string;
  fullName: string;
  amount: number;
  payeeName: string;
  status: string;
}) {
  return safeSendEmail(
    {
      to: params.email,
      subject: "Bill payment saved",
      text: `Hi ${params.fullName}, your bill payment to ${params.payeeName} for $${params.amount.toFixed(2)} was saved (${params.status}).`,
      html: buildEmailHtml(
        "Bill payment saved",
        `<p>Hi ${escapeHtml(params.fullName)},</p>
         <p>Your bill payment to <strong>${escapeHtml(params.payeeName)}</strong> for <strong>$${params.amount.toFixed(2)}</strong> was saved.</p>
         <p>Status: ${escapeHtml(params.status)}. Bill payments are submitted for review before posting.</p>`,
      ),
      idempotencyKey: `bill-payment-created/${params.email}/${params.amount}/${Date.now()}`,
    },
    "sendBillPaymentCreatedEmail",
  );
}

export async function sendBillPaymentReviewedEmail(params: {
  email: string;
  fullName: string;
  amount: number;
  payeeName: string;
  status: string;
  reference?: string;
}) {
  const balanceMessage =
    params.status === "POSTED"
      ? "Balances were updated after admin approval and ledger posting."
      : "Account balances were not changed.";

  return safeSendEmail(
    {
      to: params.email,
      subject: `Bill payment ${params.status.toLowerCase()}`,
      text: `Hi ${params.fullName}, your bill payment to ${params.payeeName} was ${params.status.toLowerCase()}. ${balanceMessage}`,
      html: buildEmailHtml(
        `Bill payment ${params.status.toLowerCase()}`,
        `<p>Hi ${escapeHtml(params.fullName)},</p>
         <p>Your bill payment to <strong>${escapeHtml(params.payeeName)}</strong> for <strong>$${params.amount.toFixed(2)}</strong> is now <strong>${escapeHtml(params.status)}</strong>.</p>
         ${params.reference ? `<p><strong>Reference:</strong> ${escapeHtml(params.reference)}</p>` : ""}
         <p>${balanceMessage}</p>`,
      ),
      idempotencyKey: `bill-payment-reviewed/${params.reference ?? params.payeeName}/${params.status}`,
    },
    "sendBillPaymentReviewedEmail",
  );
}

export async function sendAdjustmentPostedEmail(params: {
  email: string;
  fullName: string;
  amount: number;
  direction: "DEBIT" | "CREDIT";
  reference: string;
}) {
  return safeSendEmail(
    {
      to: params.email,
      subject: "Balance adjustment posted",
      text: `Hi ${params.fullName}, a ${params.direction.toLowerCase()} adjustment of $${params.amount.toFixed(2)} was posted (${params.reference}).`,
      html: buildEmailHtml(
        "Balance adjustment posted",
        `<p>Hi ${escapeHtml(params.fullName)},</p>
         <p>A controlled <strong>${escapeHtml(params.direction.toLowerCase())}</strong> adjustment of <strong>$${params.amount.toFixed(2)}</strong> was posted to your account.</p>
         <p><strong>Reference:</strong> ${escapeHtml(params.reference)}</p>`,
      ),
      idempotencyKey: `adjustment-posted/${params.reference}`,
    },
    "sendAdjustmentPostedEmail",
  );
}

export async function sendDisputeCreatedEmail(params: {
  email: string;
  fullName: string;
  reference: string;
  reason: string;
}) {
  return safeSendEmail(
    {
      to: params.email,
      subject: "Dispute submitted",
      text: `Hi ${params.fullName}, your dispute for ${params.reference} was received. Reason: ${params.reason}. Submitting a dispute does not automatically reverse a transaction.`,
      html: buildEmailHtml(
        "Dispute submitted",
        `<p>Hi ${escapeHtml(params.fullName)},</p>
         <p>We received your dispute for transaction <strong>${escapeHtml(params.reference)}</strong>.</p>
         <p><strong>Reason:</strong> ${escapeHtml(params.reason)}</p>
         <p>Submitting a dispute does not automatically reverse a transaction.</p>`,
      ),
      idempotencyKey: `dispute-created/${params.reference}`,
    },
    "sendDisputeCreatedEmail",
  );
}

export async function sendDisputeUpdatedEmail(params: {
  email: string;
  fullName: string;
  reference: string;
  status: string;
  resolutionNote?: string;
}) {
  return safeSendEmail(
    {
      to: params.email,
      subject: `Dispute ${params.status.toLowerCase().replaceAll("_", " ")}`,
      text: `Hi ${params.fullName}, your dispute for ${params.reference} is now ${params.status}. ${params.resolutionNote ?? ""}`,
      html: buildEmailHtml(
        "Dispute update",
        `<p>Hi ${escapeHtml(params.fullName)},</p>
         <p>Your dispute for <strong>${escapeHtml(params.reference)}</strong> is now <strong>${escapeHtml(params.status.replaceAll("_", " "))}</strong>.</p>
         ${params.resolutionNote ? `<p>${escapeHtml(params.resolutionNote)}</p>` : ""}
         <p>Disputes do not automatically reverse transactions.</p>`,
      ),
      idempotencyKey: `dispute-updated/${params.reference}/${params.status}`,
    },
    "sendDisputeUpdatedEmail",
  );
}
