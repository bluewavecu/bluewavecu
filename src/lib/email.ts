import { Resend } from "resend";
import { readEnv } from "@/lib/databaseEnv";
import { tryGetServerEnv } from "@/lib/env";
import {
  buildEmailDetailsBlock,
  buildEmailDetailsPlainText,
  buildEmailLayout,
  buildEmailText,
  escapeHtml,
  formatEmailCurrency,
  getEmailAppUrl,
  type EmailDetailRow,
} from "@/lib/emailTemplate";
import { INSTITUTION } from "@/lib/institution";

const DEFAULT_EMAIL_FROM = `${INSTITUTION.legalName} <${INSTITUTION.email}>`;

export type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  idempotencyKey?: string;
  replyTo?: string | string[];
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
      ...(payload.replyTo ? { replyTo: payload.replyTo } : {}),
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
    primaryAction: { label: "Sign in to online banking", href: "/auth/login" },
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

export async function sendEmailVerificationOtpEmail(params: {
  email: string;
  fullName: string;
  code: string;
  expiresMinutes?: number;
}) {
  const expiresMinutes = params.expiresMinutes ?? 15;
  const content = buildTransactionalEmail({
    title: "Verify your email",
    preheader: "Use this one-time code to verify your Bluewave membership email.",
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>Enter the verification code below to confirm your email address and finish setting up your membership.</p>
      <p style="margin: 24px 0; font-size: 28px; font-weight: 700; letter-spacing: 0.24em; color: #0A2A5E;">${escapeHtml(params.code)}</p>
      <p>This code expires in ${expiresMinutes} minutes. After verification, sign in with your username and password.</p>`,
    textBody: `Hi ${params.fullName},\n\nYour email verification code is ${params.code}. It expires in ${expiresMinutes} minutes.`,
    primaryAction: { label: "Verify your email", href: "/auth/verify-email" },
    securityNotice: "Never share this code with anyone, including Bluewave staff.",
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: "Verify your Bluewave email address",
      text: content.text,
      html: content.html,
      idempotencyKey: `email-verification-otp/${params.email}/${params.code}`,
    },
    "sendEmailVerificationOtpEmail",
  );
}

export async function sendAccountStatusEmail(params: {
  email: string;
  fullName: string;
  userId: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "ON_HOLD" | "DISABLED";
  statusNote?: string | null;
}) {
  const statusLabel =
    params.status === "ACTIVE"
      ? "Active"
      : params.status === "SUSPENDED"
        ? "Suspended"
        : params.status === "ON_HOLD"
          ? "On hold"
          : params.status === "DISABLED"
            ? "Disabled"
            : "Pending review";

  const message =
    params.status === "ACTIVE"
      ? "You can sign in to manage accounts, move money, pay bills, and review statements."
      : params.status === "SUSPENDED"
        ? "Online banking access is temporarily unavailable. Contact member services if you believe this is an error."
        : params.status === "ON_HOLD"
          ? "Your account is on hold while we complete a review. Contact member services if you need assistance."
          : params.status === "DISABLED"
            ? "Online banking access has been disabled. Contact member services for assistance."
            : "Your membership request remains under review. We will notify you when access is ready.";

  const noteBlock = params.statusNote
    ? `<p><strong>Note from member services:</strong> ${escapeHtml(params.statusNote)}</p>`
    : "";

  const content = buildTransactionalEmail({
    title: "Membership status updated",
    preheader: `Your Bluewave membership status is now ${statusLabel}.`,
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>Your Bluewave membership status is now <strong>${escapeHtml(statusLabel)}</strong>.</p>
      <p>${escapeHtml(message)}</p>
      ${noteBlock}`,
    textBody: `Hi ${params.fullName},\n\nYour Bluewave membership status is now ${statusLabel}.\n\n${message}${params.statusNote ? `\n\nNote: ${params.statusNote}` : ""}`,
    primaryAction:
      params.status === "ACTIVE"
        ? { label: "Sign in to online banking", href: "/auth/login" }
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
    primaryAction: { label: "Review security settings", href: "/auth/security" },
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

export async function sendPasswordResetEmail(params: {
  email: string;
  fullName: string;
  resetUrl: string;
  code: string;
  expiresMinutes?: number;
}) {
  const expiresMinutes = params.expiresMinutes ?? 30;
  const content = buildTransactionalEmail({
    title: "Reset your password",
    preheader: "Use the link or verification code below to choose a new password.",
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>We received a request to reset the password for your Bluewave online banking account.</p>
      <p>Choose a new password using the button below, or enter this verification code on the reset page:</p>
      <p style="margin: 24px 0; font-size: 28px; font-weight: 700; letter-spacing: 0.24em; color: #0A2A5E;">${escapeHtml(params.code)}</p>
      <p>This link and code expire in ${expiresMinutes} minutes. If you did not request a password reset, you can ignore this email — your password will stay the same.</p>`,
    textBody: `Hi ${params.fullName},\n\nWe received a request to reset your Bluewave password.\n\nReset link: ${params.resetUrl}\n\nVerification code: ${params.code}\n\nThis link and code expire in ${expiresMinutes} minutes. If you did not request this, ignore this email.`,
    primaryAction: { label: "Choose a new password", href: params.resetUrl },
    securityNotice:
      "Never share your password or verification code with anyone, including Bluewave staff.",
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: "Reset your Bluewave password",
      text: content.text,
      html: content.html,
      idempotencyKey: `password-reset/${params.email}/${params.code}`,
    },
    "sendPasswordResetEmail",
  );
}

export async function sendLoginOtpEmail(params: {
  email: string;
  fullName: string;
  code: string;
  deviceName: string;
  expiresMinutes?: number;
}) {
  const expiresMinutes = params.expiresMinutes ?? 10;
  const content = buildTransactionalEmail({
    title: "Verify your sign-in",
    preheader: "Use this one-time code to sign in from a new device.",
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>We noticed a sign-in attempt from <strong>${escapeHtml(params.deviceName)}</strong>. Enter the verification code below to continue.</p>
      <p style="margin: 24px 0; font-size: 28px; font-weight: 700; letter-spacing: 0.24em; color: #0A2A5E;">${escapeHtml(params.code)}</p>
      <p>This code expires in ${expiresMinutes} minutes. If this wasn't you, reset your password and contact member services.</p>`,
    textBody: `Hi ${params.fullName},\n\nYour sign-in verification code is ${params.code}. It expires in ${expiresMinutes} minutes.`,
    primaryAction: { label: "Sign in to online banking", href: "/auth/login" },
    securityNotice: "Never share this code with anyone, including Bluewave staff.",
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: "Your Bluewave sign-in verification code",
      text: content.text,
      html: content.html,
      idempotencyKey: `login-otp/${params.email}/${params.code}`,
    },
    "sendLoginOtpEmail",
  );
}

export async function sendTransactionOtpEmail(params: {
  email: string;
  fullName: string;
  code: string;
  amount: number;
  expiresMinutes?: number;
}) {
  const expiresMinutes = params.expiresMinutes ?? 10;
  const content = buildTransactionalEmail({
    title: "Confirm your transfer",
    preheader: "Use this one-time code to confirm your transfer request.",
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>Use the verification code below to confirm your transfer request for <strong>${escapeHtml(formatEmailCurrency(params.amount))}</strong>.</p>
      <p style="margin: 24px 0; font-size: 28px; font-weight: 700; letter-spacing: 0.24em; color: #0A2A5E;">${escapeHtml(params.code)}</p>
      <p>This code expires in ${expiresMinutes} minutes. If you did not initiate this transfer, contact member services immediately.</p>`,
    textBody: `Hi ${params.fullName},\n\nYour transfer verification code is ${params.code}. It expires in ${expiresMinutes} minutes.`,
    primaryAction: { label: "Review transfers", href: "/auth/transfers" },
    securityNotice: "Never share this code with anyone, including Bluewave staff.",
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: "Your transfer verification code",
      text: content.text,
      html: content.html,
      idempotencyKey: `transaction-otp/${params.email}/${params.code}`,
    },
    "sendTransactionOtpEmail",
  );
}

export async function sendTransactionPinEmail(params: {
  email: string;
  fullName: string;
  pin: string;
}) {
  const content = buildTransactionalEmail({
    title: "Your transaction PIN",
    preheader: "A six-digit transaction PIN was assigned to your Bluewave account.",
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>Member services assigned a six-digit transaction PIN to your Bluewave account. Enter this PIN when submitting transfers in online banking.</p>
      <p style="margin: 24px 0; font-size: 28px; font-weight: 700; letter-spacing: 0.24em; color: #0A2A5E;">${escapeHtml(params.pin)}</p>
      <p>Do not share this PIN with anyone. Contact member services immediately if you did not request this change.</p>`,
    textBody: `Hi ${params.fullName},\n\nYour Bluewave transaction PIN is ${params.pin}.`,
    primaryAction: { label: "Open transfers", href: "/auth/transfers" },
    securityNotice: "Bluewave will never ask for your transaction PIN by phone or email.",
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: "Your Bluewave transaction PIN",
      text: content.text,
      html: content.html,
      idempotencyKey: `transaction-pin/${params.email}/${params.pin}`,
    },
    "sendTransactionPinEmail",
  );
}

function buildAdjustmentPostedMessage(direction: "DEBIT" | "CREDIT", amount: number) {
  const formatted = formatEmailCurrency(amount);

  if (direction === "CREDIT") {
    return `You have been credited ${formatted}, which has been posted to your account.`;
  }

  return `${formatted} has been withdrawn from your account.`;
}

function buildTransactionEmailBody(params: {
  fullName: string;
  amount: number;
  reference: string;
  description: string;
  headline: string;
  detail: string;
}) {
  return `<p>Hi ${escapeHtml(params.fullName)},</p>
    <p>${escapeHtml(params.headline)}</p>
    <p><strong>Amount:</strong> ${escapeHtml(formatEmailCurrency(params.amount))}</p>
    <p><strong>Reference:</strong> ${escapeHtml(params.reference)}</p>
    <p><strong>Details:</strong> ${escapeHtml(params.description)}</p>
    <p>${escapeHtml(params.detail)}</p>`;
}

export async function sendTransactionPendingEmail(params: {
  email: string;
  fullName: string;
  amount: number;
  reference: string;
  description: string;
}) {
  const content = buildTransactionalEmail({
    title: "We're reviewing your transfer",
    preheader: "We received your transfer and are reviewing it now.",
    bodyHtml: buildTransactionEmailBody({
      ...params,
      headline: "We received your transfer and are reviewing it now.",
      detail: "Your balance won't change until we finish our review.",
    }),
    textBody: `Hi ${params.fullName},\n\nWe received your transfer of ${formatEmailCurrency(params.amount)} (${params.reference}). We're reviewing it now and will email you when it's complete.`,
    primaryAction: { label: "View transfers", href: "/auth/transfers" },
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: "We received your transfer",
      text: content.text,
      html: content.html,
      idempotencyKey: `transaction-pending/${params.reference}`,
    },
    "sendTransactionPendingEmail",
  );
}

export async function sendTransactionApprovedEmail(params: {
  email: string;
  fullName: string;
  amount: number;
  reference: string;
  description: string;
}) {
  const content = buildTransactionalEmail({
    title: "Your transfer was approved",
    preheader: "Your transfer was approved and the money has been sent.",
    bodyHtml: buildTransactionEmailBody({
      ...params,
      headline: "Good news — your transfer was approved.",
      detail: "The money has been sent and your balance is updated.",
    }),
    textBody: `Hi ${params.fullName},\n\nYour transfer of ${formatEmailCurrency(params.amount)} (${params.reference}) was approved. The money has been sent and your balance is updated.`,
    primaryAction: { label: "View activity", href: "/auth/transactions" },
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: "Your transfer was approved",
      text: content.text,
      html: content.html,
      idempotencyKey: `transaction-approved/${params.reference}`,
    },
    "sendTransactionApprovedEmail",
  );
}

export async function sendTransactionSuccessfulEmail(params: {
  email: string;
  fullName: string;
  amount: number;
  reference: string;
  description: string;
}) {
  const content = buildTransactionalEmail({
    title: "Your transfer is complete",
    preheader: "Your transfer went through successfully.",
    bodyHtml: buildTransactionEmailBody({
      ...params,
      headline: "Your transfer is complete.",
      detail: "The money has been sent and your balance is updated.",
    }),
    textBody: `Hi ${params.fullName},\n\nYour transfer of ${formatEmailCurrency(params.amount)} (${params.reference}) is complete. The money has been sent and your balance is updated.`,
    primaryAction: { label: "View activity", href: "/auth/transactions" },
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: "Your transfer is complete",
      text: content.text,
      html: content.html,
      idempotencyKey: `transaction-success/${params.reference}`,
    },
    "sendTransactionSuccessfulEmail",
  );
}

export async function sendTransactionRejectedEmail(params: {
  email: string;
  fullName: string;
  amount: number;
  reference: string;
  description: string;
  reviewNote?: string | null;
}) {
  const noteBlock = params.reviewNote
    ? `<p><strong>Note from our team:</strong> ${escapeHtml(params.reviewNote)}</p>`
    : "";

  const content = buildTransactionalEmail({
    title: "We couldn't approve your transfer",
    preheader: "Your transfer was not approved.",
    bodyHtml: `${buildTransactionEmailBody({
      ...params,
      headline: "We weren't able to approve this transfer.",
      detail: "No money was moved from your account.",
    })}${noteBlock}`,
    textBody: `Hi ${params.fullName},\n\nWe weren't able to approve your transfer ${params.reference}. No money was moved from your account.${params.reviewNote ? `\n\nNote from our team: ${params.reviewNote}` : ""}`,
    primaryAction: { label: "View transfers", href: "/auth/transfers" },
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: "Update on your transfer",
      text: content.text,
      html: content.html,
      idempotencyKey: `transaction-rejected/${params.reference}`,
    },
    "sendTransactionRejectedEmail",
  );
}

export async function sendTransactionDelayedEmail(params: {
  email: string;
  fullName: string;
  amount: number;
  reference: string;
  description: string;
  reviewNote?: string | null;
}) {
  const noteBlock = params.reviewNote
    ? `<p><strong>Note from our team:</strong> ${escapeHtml(params.reviewNote)}</p>`
    : "";

  const content = buildTransactionalEmail({
    title: "Your transfer needs a little more time",
    preheader: "We need a little more time to review your transfer.",
    bodyHtml: `${buildTransactionEmailBody({
      ...params,
      headline: "We need a little more time to review your transfer.",
      detail: "Your balance won't change while we finish reviewing. We'll email you as soon as we have an update.",
    })}${noteBlock}`,
    textBody: `Hi ${params.fullName},\n\nWe need a little more time to review your transfer ${params.reference}. Your balance won't change while we finish reviewing.${params.reviewNote ? `\n\nNote from our team: ${params.reviewNote}` : ""}`,
    primaryAction: { label: "View transfers", href: "/auth/transfers" },
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: "Update on your transfer review",
      text: content.text,
      html: content.html,
      idempotencyKey: `transaction-delayed/${params.reference}`,
    },
    "sendTransactionDelayedEmail",
  );
}

export async function sendTransferCreatedEmail(params: {
  email: string;
  fullName: string;
  amount: number;
  reference: string;
  description: string;
}) {
  return sendTransactionPendingEmail(params);
}

export async function sendTransferStatusEmail(params: {
  email: string;
  fullName: string;
  amount: number;
  reference: string;
  description: string;
  status: "COMPLETED" | "FAILED" | "REVERSED";
  reviewNote?: string | null;
}) {
  if (params.status === "COMPLETED") {
    return sendTransactionApprovedEmail(params);
  }

  if (params.status === "FAILED") {
    return sendTransactionRejectedEmail(params);
  }

  const balanceMessage = "No money was moved from your account.";

  const content = buildTransactionalEmail({
    title: "Your transfer was reversed",
    preheader: `Your transfer ${params.reference} was reversed.`,
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>Your transfer <strong>${escapeHtml(params.reference)}</strong> for <strong>${escapeHtml(formatEmailCurrency(params.amount))}</strong> was reversed.</p>
      <p><strong>Details:</strong> ${escapeHtml(params.description)}</p>
      <p>${escapeHtml(balanceMessage)}</p>`,
    textBody: `Hi ${params.fullName},\n\nYour transfer ${params.reference} was reversed. ${balanceMessage}`,
    primaryAction: { label: "View activity", href: "/auth/transactions" },
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: "Your transfer was reversed",
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
    primaryAction: { label: "View support tickets", href: "/auth/support" },
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
    primaryAction: { label: "Open support", href: "/auth/support" },
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

export type ContactFormEmailInput = {
  fullName: string;
  email: string;
  phone?: string;
  topic: string;
  message: string;
  reference: string;
  submittedAt?: string;
};

function buildContactFormMemberDetailRows(params: ContactFormEmailInput): EmailDetailRow[] {
  return [
    { label: "Reference", value: params.reference },
    { label: "Topic", value: params.topic },
    { label: "Message", value: params.message },
    { label: "Name", value: params.fullName },
    { label: "Email", value: params.email },
    { label: "Phone", value: params.phone?.trim() || "Not provided" },
    ...(params.submittedAt ? [{ label: "Submitted", value: params.submittedAt }] : []),
  ];
}

function buildContactFormAdminDetailRows(params: ContactFormEmailInput): EmailDetailRow[] {
  return [
    { label: "Topic", value: params.topic },
    { label: "Reference", value: params.reference },
    ...(params.submittedAt ? [{ label: "Submitted", value: params.submittedAt }] : []),
    { label: "From", value: params.fullName },
    { label: "Email", value: params.email },
    { label: "Phone", value: params.phone?.trim() || "Not provided" },
    { label: "Message", value: params.message },
  ];
}

export async function sendContactConfirmationEmail(params: ContactFormEmailInput) {
  const detailRows = buildContactFormMemberDetailRows(params);
  const detailsHtml = buildEmailDetailsBlock(detailRows);
  const detailsText = buildEmailDetailsPlainText(detailRows);

  const content = buildTransactionalEmail({
    title: "We received your message",
    preheader: `We received your ${params.topic.toLowerCase()} message — reference ${params.reference}.`,
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>Thank you for contacting Bluewave Credit Union about <strong>${escapeHtml(params.topic)}</strong>. We received your message and a member services representative will reply using the email address you provided.</p>
      <p>Keep the details below for your records:</p>
      ${detailsHtml}
      <p>Typical response time is one business day during ${escapeHtml(INSTITUTION.memberServicesHoursShort)}.</p>`,
    textBody: `Hi ${params.fullName},\n\nThank you for contacting Bluewave Credit Union about ${params.topic}. We received your message and will reply using the email address you provided.\n\n${detailsText}\n\nTypical response time is one business day during ${INSTITUTION.memberServicesHoursShort}.`,
    primaryAction: { label: "Visit member support", href: "/support" },
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: `We received your message — ${params.topic}`,
      text: content.text,
      html: content.html,
      idempotencyKey: `contact-confirmation/${params.reference}`,
    },
    "sendContactConfirmationEmail",
  );
}

export async function sendContactFormAdminEmail(params: ContactFormEmailInput) {
  const config = getEmailConfig();
  const detailRows = buildContactFormAdminDetailRows(params);
  const detailsHtml = buildEmailDetailsBlock(detailRows);
  const detailsText = buildEmailDetailsPlainText(detailRows);

  if (!config.adminAlertEmail) {
    logEmailPayload(
      {
        to: "admin-alert-disabled",
        subject: `Contact form: ${params.topic}`,
        html: detailsText,
        text: detailsText,
        idempotencyKey: `contact-form-admin/${params.reference}`,
      },
      "ADMIN_ALERT_EMAIL missing — logged instead of sent",
    );
    return { ok: true as const, mode: "logged" as const };
  }

  const content = buildTransactionalEmail({
    title: "New contact form message",
    preheader: `${params.topic} message from ${params.fullName} — reply to ${params.email}.`,
    bodyHtml: `<p><strong>${escapeHtml(params.fullName)}</strong> sent a new contact form message about <strong>${escapeHtml(params.topic)}</strong>.</p>
      <p>Review the message below, then reply directly to <a href="mailto:${escapeHtml(params.email)}" style="color: #0D47A1; text-decoration: none; font-weight: 700;">${escapeHtml(params.email)}</a>.</p>
      ${detailsHtml}`,
    textBody: `New contact form message\n\n${params.fullName} sent a message about ${params.topic}.\n\n${detailsText}\n\nReply to: ${params.email}`,
    primaryAction: { label: "Open operations console", href: "/lex/auth" },
  });

  return safeSendEmail(
    {
      to: config.adminAlertEmail,
      subject: `[Bluewave Admin] Contact form: ${params.topic} — ${params.fullName}`,
      text: content.text,
      html: content.html,
      replyTo: params.email,
      idempotencyKey: `contact-form-admin/${params.reference}`,
    },
    "sendContactFormAdminEmail",
  );
}

export type MembershipApplicationAdminEmailInput = {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  occupation: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  userId: string;
  requestedAccountTypes: string;
};

function formatMembershipApplicationAddress(params: Omit<
  MembershipApplicationAdminEmailInput,
  "fullName" | "email" | "phone" | "dateOfBirth" | "occupation" | "userId"
>) {
  return [
    params.addressLine1,
    params.addressLine2,
    `${params.city}, ${params.state} ${params.postalCode}`,
    params.country,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildMembershipApplicationDetailRows(
  params: MembershipApplicationAdminEmailInput,
): EmailDetailRow[] {
  return [
    { label: "Status", value: "Pending review" },
    { label: "Applicant", value: params.fullName },
    { label: "Email", value: params.email },
    { label: "Phone", value: params.phone },
    { label: "Date of birth", value: params.dateOfBirth },
    { label: "Occupation", value: params.occupation },
    {
      label: "Address",
      value: formatMembershipApplicationAddress(params),
    },
    {
      label: "Requested accounts",
      value: params.requestedAccountTypes,
    },
  ];
}

export async function sendMembershipApplicationAdminEmail(
  params: MembershipApplicationAdminEmailInput,
) {
  const config = getEmailConfig();
  const detailRows = buildMembershipApplicationDetailRows(params);
  const detailsHtml = buildEmailDetailsBlock(detailRows);
  const detailsText = buildEmailDetailsPlainText(detailRows);

  if (!config.adminAlertEmail) {
    logEmailPayload(
      {
        to: "admin-alert-disabled",
        subject: "New membership application",
        html: detailsText,
        text: detailsText,
        idempotencyKey: `membership-application-admin/${params.userId}`,
      },
      "ADMIN_ALERT_EMAIL missing — logged instead of sent",
    );
    return { ok: true as const, mode: "logged" as const };
  }

  const content = buildTransactionalEmail({
    title: "New membership application",
    preheader: `${params.fullName} submitted a membership application — pending review.`,
    bodyHtml: `<p><strong>${escapeHtml(params.fullName)}</strong> submitted a new membership application.</p>
      <p>Review the applicant details below, then sign in to the operations console to approve or follow up.</p>
      ${detailsHtml}`,
    textBody: `New membership application\n\n${params.fullName} submitted a new membership application.\n\n${detailsText}\n\nSign in to the operations console to review this application.`,
    primaryAction: { label: "Open operations console", href: "/lex/auth" },
  });

  return safeSendEmail(
    {
      to: config.adminAlertEmail,
      subject: `[Bluewave Admin] New membership application — ${params.fullName}`,
      text: content.text,
      html: content.html,
      idempotencyKey: `membership-application-admin/${params.userId}`,
    },
    "sendMembershipApplicationAdminEmail",
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
    primaryAction: { label: "Manage payees", href: "/auth/payees" },
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
      <p>We've saved your bill payment to <strong>${escapeHtml(params.payeeName)}</strong> for <strong>${escapeHtml(formatEmailCurrency(params.amount))}</strong>.</p>
      <p>We're reviewing it now and will email you when it's complete.</p>`,
    textBody: `Hi ${params.fullName},\n\nYour bill payment to ${params.payeeName} for ${formatEmailCurrency(params.amount)} was saved (${params.status}).`,
    primaryAction: { label: "View bill pay", href: "/auth/bill-pay" },
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
      ? "The payment has been sent and your balance is updated."
      : "No money was moved from your account.";

  const content = buildTransactionalEmail({
    title: `Bill payment ${params.status.toLowerCase()}`,
    preheader: `Your bill payment to ${params.payeeName} was ${params.status.toLowerCase()}.`,
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>Your bill payment to <strong>${escapeHtml(params.payeeName)}</strong> for <strong>${escapeHtml(formatEmailCurrency(params.amount))}</strong> is now <strong>${escapeHtml(params.status)}</strong>.</p>
      ${params.reference ? `<p><strong>Reference:</strong> ${escapeHtml(params.reference)}</p>` : ""}
      <p>${escapeHtml(balanceMessage)}</p>`,
    textBody: `Hi ${params.fullName},\n\nYour bill payment to ${params.payeeName} was ${params.status.toLowerCase()}. ${balanceMessage}`,
    primaryAction: { label: "View bill pay history", href: "/auth/bill-pay" },
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
  const adjustmentMessage = buildAdjustmentPostedMessage(params.direction, params.amount);

  const content = buildTransactionalEmail({
    title: "Your account was updated",
    preheader: adjustmentMessage,
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>${escapeHtml(adjustmentMessage)}</p>
      <p><strong>Reference:</strong> ${escapeHtml(params.reference)}</p>`,
    textBody: `Hi ${params.fullName},\n\n${adjustmentMessage}\n\nReference: ${params.reference}`,
    primaryAction: { label: "View accounts", href: "/auth/accounts" },
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: "Your account was updated",
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
    primaryAction: { label: "View disputes", href: "/auth/disputes" },
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
    primaryAction: { label: "View disputes", href: "/auth/disputes" },
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
    primaryAction: { label: "View profile", href: "/auth/profile" },
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

export async function sendIdVerificationReviewEmail(params: {
  email: string;
  fullName: string;
  status: "APPROVED" | "REJECTED" | "DECLINED";
  reviewNote?: string;
}) {
  const statusLabel =
    params.status === "APPROVED"
      ? "approved"
      : params.status === "REJECTED"
        ? "rejected"
        : "declined";

  const content = buildTransactionalEmail({
    title: "ID verification update",
    preheader: `Your ID verification was ${statusLabel}.`,
    bodyHtml: `<p>Hi ${escapeHtml(params.fullName)},</p>
      <p>Your ID verification was <strong>${escapeHtml(statusLabel)}</strong>.</p>
      ${params.reviewNote ? `<p>${escapeHtml(params.reviewNote)}</p>` : ""}
      <p>Visit your profile page to review the decision or submit updated ID photos if needed.</p>`,
    textBody: `Hi ${params.fullName},\n\nYour ID verification was ${statusLabel}. ${params.reviewNote ?? ""}`,
    primaryAction: { label: "View profile", href: "/auth/profile" },
  });

  return safeSendEmail(
    {
      to: params.email,
      subject: `ID verification ${statusLabel}`,
      text: content.text,
      html: content.html,
      idempotencyKey: `id-verification/${params.email}/${params.status}/${params.reviewNote ?? "none"}`,
    },
    "sendIdVerificationReviewEmail",
  );
}
