import { Resend } from "resend";
import { readEnv } from "@/lib/databaseEnv";
import { tryGetServerEnv } from "@/lib/env";
import {
  buildEmailLayout,
  buildEmailText,
  escapeHtml,
  formatEmailCurrency,
  getEmailAppUrl,
} from "@/lib/emailTemplate";
import { INSTITUTION } from "@/lib/institution";

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

  const nodeEnv = readEnv("NODE_ENV") ?? tryGetServerEnv()?.NODE_ENV ?? "development";
  const resendApiKey = readEnv("RESEND_API_KEY");
  const emailFrom = readEnv("EMAIL_FROM") || DEFAULT_EMAIL_FROM;
  const adminAlertEmail = readEnv("ADMIN_ALERT_EMAIL")?.toLowerCase() || INSTITUTION.email;
  const isProduction = nodeEnv === "production";

  cachedEmailConfig = {
    resendApiKey: resendApiKey ?? null,
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

function buildTransactionalEmail(options: {
  title: string;
  preheader?: string;
  bodyHtml: string;
  textBody: string;
  primaryAction?: { label: string; href: string };
  securityNotice?: string;
}) {
  const appUrl = getEmailAppUrl();

  return {
    html: buildEmailLayout({
      title: options.title,
      preheader: options.preheader,
      bodyHtml: options.bodyHtml,
      appUrl,
      primaryAction: options.primaryAction,
      securityNotice: options.securityNotice,
    }),
    text: buildEmailText(options.title, options.textBody, appUrl),
  };
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
  const content = buildTransactionalEmail({
    title: "Welcome to Bluewave",
    preheader: "Your Bluewave membership request was received.",
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>Thank you for choosing Bluewave Credit Union. Your membership request has been received and is pending review by our member services team.</p>
      <p>We will notify you when your account is ready for full online banking access.</p>`,
    textBody: `Hi ${params.fullName},\n\nThank you for registering with Bluewave Credit Union. Your membership request has been received and is pending review.`,
    primaryAction: { label: "View membership status", href: "/dashboard" },
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: "Welcome to Bluewave Credit Union",
      text: content.text,
      html: content.html,
      idempotencyKey: `welcome-email/${params.userId}`,
    },
    "sendWelcomeEmail",
  );
}

export async function sendAccountStatusEmail(params: {
  email: string;
  fullName: string;
  userId: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
}) {
  const statusLabel =
    params.status === "ACTIVE"
      ? "Active"
      : params.status === "SUSPENDED"
        ? "Suspended"
        : "Pending review";

  const message =
    params.status === "ACTIVE"
      ? "You can sign in to manage accounts, move money, pay bills, and review statements."
      : params.status === "SUSPENDED"
        ? "Online banking access is temporarily unavailable. Contact member services if you believe this is an error."
        : "Your membership request remains under review. We will notify you when access is ready.";

  const content = buildTransactionalEmail({
    title: "Membership status updated",
    preheader: `Your Bluewave membership status is now ${statusLabel}.`,
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>Your Bluewave membership status is now <strong>${escapeHtml(statusLabel)}</strong>.</p>
      <p>${escapeHtml(message)}</p>`,
    textBody: `Hi ${params.fullName},\n\nYour Bluewave membership status is now ${statusLabel}.\n\n${message}`,
    primaryAction:
      params.status === "ACTIVE"
        ? { label: "Sign in to online banking", href: "/auth" }
        : { label: "Contact member services", href: "/support" },
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: `Your Bluewave membership is ${statusLabel.toLowerCase()}`,
      text: content.text,
      html: content.html,
      idempotencyKey: `account-status/${params.userId}/${params.status}`,
    },
    "sendAccountStatusEmail",
  );
}

export async function sendLoginAlertEmail(params: {
  email: string;
  fullName: string;
  userId: string;
  loginAt?: Date;
}) {
  const loginAt = params.loginAt ?? new Date();
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Chicago",
  }).format(loginAt);

  const content = buildTransactionalEmail({
    title: "Sign-in alert",
    preheader: "A new sign-in to your Bluewave account was detected.",
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>A new sign-in to your Bluewave account was detected on <strong>${escapeHtml(formattedTime)} CT</strong>.</p>
      <p>If this was you, no action is needed. If you do not recognize this activity, contact member services immediately.</p>`,
    textBody: `Hi ${params.fullName},\n\nA new sign-in to your Bluewave account was detected at ${formattedTime} CT.`,
    primaryAction: { label: "Review security settings", href: "/member/security" },
    securityNotice:
      "Bluewave will never ask you to share your password, verification codes, or full card numbers by email or phone.",
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: "New sign-in to your Bluewave account",
      text: content.text,
      html: content.html,
      idempotencyKey: `login-alert/${params.userId}/${loginAt.toISOString().slice(0, 16)}`,
    },
    "sendLoginAlertEmail",
  );
}

export async function sendPasswordChangedEmail(params: {
  email: string;
  fullName: string;
  userId: string;
}) {
  const content = buildTransactionalEmail({
    title: "Password updated",
    preheader: "Your Bluewave online banking password was changed.",
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>The password for your Bluewave online banking profile was changed successfully.</p>
      <p>If you did not make this change, contact member services immediately so we can secure your account.</p>`,
    textBody: `Hi ${params.fullName},\n\nThe password for your Bluewave online banking profile was changed successfully.`,
    primaryAction: { label: "Contact member services", href: "/support" },
    securityNotice:
      "Never share your password or one-time verification codes with anyone, including Bluewave staff.",
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: "Your Bluewave password was updated",
      text: content.text,
      html: content.html,
      idempotencyKey: `password-changed/${params.userId}/${Date.now()}`,
    },
    "sendPasswordChangedEmail",
  );
}

export async function sendTransferCreatedEmail(params: {
  email: string;
  fullName: string;
  amount: number;
  reference: string;
  description: string;
}) {
  const content = buildTransactionalEmail({
    title: "Transfer request submitted",
    preheader: "Your transfer request is pending review.",
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>Your transfer request for <strong>${escapeHtml(formatEmailCurrency(params.amount))}</strong> has been submitted and is pending review.</p>
      <p><strong>Reference:</strong> ${escapeHtml(params.reference)}</p>
      <p><strong>Details:</strong> ${escapeHtml(params.description)}</p>
      <p>Account balances remain unchanged until the request is reviewed.</p>`,
    textBody: `Hi ${params.fullName},\n\nYour transfer request for ${formatEmailCurrency(params.amount)} (${params.reference}) is pending review.`,
    primaryAction: { label: "View transfers", href: "/transfers" },
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: "Transfer request submitted for review",
      text: content.text,
      html: content.html,
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

  const content = buildTransactionalEmail({
    title: `Transfer request ${statusLabel}`,
    preheader: `Your transfer ${params.reference} was ${statusLabel}.`,
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>Your transfer request <strong>${escapeHtml(params.reference)}</strong> for <strong>${escapeHtml(formatEmailCurrency(params.amount))}</strong> has been <strong>${escapeHtml(statusLabel)}</strong>.</p>
      <p><strong>Details:</strong> ${escapeHtml(params.description)}</p>
      <p>${escapeHtml(balanceMessage)}</p>`,
    textBody: `Hi ${params.fullName},\n\nYour transfer ${params.reference} was ${statusLabel}. ${balanceMessage}`,
    primaryAction: { label: "View activity", href: "/transactions" },
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: `Transfer request ${statusLabel}`,
      text: content.text,
      html: content.html,
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
  const content = buildTransactionalEmail({
    title: "Support ticket received",
    preheader: "We received your support request.",
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>We received your support request and our member services team will review it shortly.</p>
      <p><strong>Subject:</strong> ${escapeHtml(params.subject)}</p>
      <p><strong>Ticket ID:</strong> ${escapeHtml(params.ticketId)}</p>`,
    textBody: `Hi ${params.fullName},\n\nWe received your support ticket: ${params.subject}\nTicket ID: ${params.ticketId}`,
    primaryAction: { label: "View support tickets", href: "/member/support" },
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: "Support ticket received",
      text: content.text,
      html: content.html,
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

  const content = buildTransactionalEmail({
    title: "Support ticket updated",
    preheader: `Your support ticket is now ${statusLabel}.`,
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>Your support ticket has been updated.</p>
      <p><strong>Subject:</strong> ${escapeHtml(params.subject)}</p>
      <p><strong>Status:</strong> ${escapeHtml(statusLabel)}</p>
      <p><strong>Ticket ID:</strong> ${escapeHtml(params.ticketId)}</p>`,
    textBody: `Hi ${params.fullName},\n\nYour support ticket "${params.subject}" is now ${statusLabel}.`,
    primaryAction: { label: "Open support", href: "/member/support" },
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: "Support ticket update",
      text: content.text,
      html: content.html,
      idempotencyKey: `support-updated/${params.ticketId}/${params.status}`,
    },
    "sendSupportTicketUpdatedEmail",
  );
}

export async function sendContactConfirmationEmail(params: {
  email: string;
  fullName: string;
  topic: string;
  reference: string;
}) {
  const content = buildTransactionalEmail({
    title: "Message received",
    preheader: "We received your message to Bluewave Credit Union.",
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>Thank you for contacting Bluewave Credit Union. We received your message regarding <strong>${escapeHtml(params.topic)}</strong>.</p>
      <p><strong>Reference:</strong> ${escapeHtml(params.reference)}</p>
      <p>A member services representative will respond using the email address you provided.</p>`,
    textBody: `Hi ${params.fullName},\n\nWe received your contact form message regarding ${params.topic}. Reference: ${params.reference}`,
    primaryAction: { label: "Visit Bluewave", href: "/" },
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: "We received your message",
      text: content.text,
      html: content.html,
      idempotencyKey: `contact-confirmation/${params.reference}`,
    },
    "sendContactConfirmationEmail",
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

  const content = buildTransactionalEmail({
    title: params.subject,
    preheader: params.subject,
    bodyHtml: `<p>${escapeHtml(params.message)}</p>`,
    textBody: params.message,
    primaryAction: { label: "Open operations console", href: "/lex/auth" },
  });

  return safeSendEmail(
    {
      to: config.adminAlertEmail,
      subject: `[Bluewave Admin] ${params.subject}`,
      text: content.text,
      html: content.html,
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
  const content = buildTransactionalEmail({
    title: "Payee added",
    preheader: `${params.payeeName} was added to your payee list.`,
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p><strong>${escapeHtml(params.payeeName)}</strong> was added to your Bluewave payee list.</p>
      <p>If you did not add this payee, contact member services immediately.</p>`,
    textBody: `Hi ${params.fullName},\n\n${params.payeeName} was added to your Bluewave payee list.`,
    primaryAction: { label: "Manage payees", href: "/payees" },
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: "Payee added to your account",
      text: content.text,
      html: content.html,
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
  const content = buildTransactionalEmail({
    title: "Bill payment saved",
    preheader: "Your bill payment was saved for review.",
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>Your bill payment to <strong>${escapeHtml(params.payeeName)}</strong> for <strong>${escapeHtml(formatEmailCurrency(params.amount))}</strong> was saved.</p>
      <p>Status: <strong>${escapeHtml(params.status)}</strong>. Bill payments are submitted for review before posting.</p>`,
    textBody: `Hi ${params.fullName},\n\nYour bill payment to ${params.payeeName} for ${formatEmailCurrency(params.amount)} was saved (${params.status}).`,
    primaryAction: { label: "View bill pay", href: "/bill-pay" },
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: "Bill payment saved",
      text: content.text,
      html: content.html,
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
      ? "Balances were updated after operations approval and ledger posting."
      : "Account balances were not changed.";

  const content = buildTransactionalEmail({
    title: `Bill payment ${params.status.toLowerCase()}`,
    preheader: `Your bill payment to ${params.payeeName} was ${params.status.toLowerCase()}.`,
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>Your bill payment to <strong>${escapeHtml(params.payeeName)}</strong> for <strong>${escapeHtml(formatEmailCurrency(params.amount))}</strong> is now <strong>${escapeHtml(params.status)}</strong>.</p>
      ${params.reference ? `<p><strong>Reference:</strong> ${escapeHtml(params.reference)}</p>` : ""}
      <p>${escapeHtml(balanceMessage)}</p>`,
    textBody: `Hi ${params.fullName},\n\nYour bill payment to ${params.payeeName} was ${params.status.toLowerCase()}. ${balanceMessage}`,
    primaryAction: { label: "View bill pay history", href: "/bill-pay" },
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: `Bill payment ${params.status.toLowerCase()}`,
      text: content.text,
      html: content.html,
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
  const content = buildTransactionalEmail({
    title: "Balance adjustment posted",
    preheader: "A balance adjustment was posted to your account.",
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>A controlled <strong>${escapeHtml(params.direction.toLowerCase())}</strong> adjustment of <strong>${escapeHtml(formatEmailCurrency(params.amount))}</strong> was posted to your account.</p>
      <p><strong>Reference:</strong> ${escapeHtml(params.reference)}</p>`,
    textBody: `Hi ${params.fullName},\n\nA ${params.direction.toLowerCase()} adjustment of ${formatEmailCurrency(params.amount)} was posted (${params.reference}).`,
    primaryAction: { label: "View accounts", href: "/accounts" },
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: "Balance adjustment posted",
      text: content.text,
      html: content.html,
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
  const content = buildTransactionalEmail({
    title: "Dispute submitted",
    preheader: "We received your transaction dispute.",
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>We received your dispute for transaction <strong>${escapeHtml(params.reference)}</strong>.</p>
      <p><strong>Reason:</strong> ${escapeHtml(params.reason)}</p>
      <p>Submitting a dispute does not automatically reverse a transaction.</p>`,
    textBody: `Hi ${params.fullName},\n\nWe received your dispute for ${params.reference}. Reason: ${params.reason}`,
    primaryAction: { label: "View disputes", href: "/disputes" },
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: "Dispute submitted",
      text: content.text,
      html: content.html,
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
  const statusLabel = params.status.replaceAll("_", " ");

  const content = buildTransactionalEmail({
    title: "Dispute update",
    preheader: `Your dispute is now ${statusLabel.toLowerCase()}.`,
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>Your dispute for <strong>${escapeHtml(params.reference)}</strong> is now <strong>${escapeHtml(statusLabel)}</strong>.</p>
      ${params.resolutionNote ? `<p>${escapeHtml(params.resolutionNote)}</p>` : ""}
      <p>Disputes do not automatically reverse transactions.</p>`,
    textBody: `Hi ${params.fullName},\n\nYour dispute for ${params.reference} is now ${statusLabel}. ${params.resolutionNote ?? ""}`,
    primaryAction: { label: "View disputes", href: "/disputes" },
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: `Dispute ${statusLabel.toLowerCase()}`,
      text: content.text,
      html: content.html,
      idempotencyKey: `dispute-updated/${params.reference}/${params.status}`,
    },
    "sendDisputeUpdatedEmail",
  );
}

export async function sendKycStatusEmail(params: {
  email: string;
  fullName: string;
  status: string;
  reviewNote?: string;
}) {
  const statusLabel = params.status.replaceAll("_", " ").toLowerCase();

  const content = buildTransactionalEmail({
    title: "Identity verification update",
    preheader: `Your identity verification status is now ${statusLabel}.`,
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>Your identity verification status is now <strong>${escapeHtml(statusLabel)}</strong>.</p>
      ${params.reviewNote ? `<p>${escapeHtml(params.reviewNote)}</p>` : ""}
      <p>Visit your profile page to review details or resubmit if needed.</p>`,
    textBody: `Hi ${params.fullName},\n\nYour identity verification status is now ${statusLabel}. ${params.reviewNote ?? ""}`,
    primaryAction: { label: "View profile", href: "/profile" },
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: `KYC review ${statusLabel}`,
      text: content.text,
      html: content.html,
      idempotencyKey: `kyc-status/${params.email}/${params.status}`,
    },
    "sendKycStatusEmail",
  );
}
