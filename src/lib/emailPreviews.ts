import {
  buildEmailLayout,
  buildEmailPlainTextFooter,
  buildEmailText,
  escapeHtml,
  formatEmailCurrency,
  getEmailAppUrl,
} from "@/lib/emailTemplate";

const APP_URL = "https://bluewavecu.com";

export type EmailPreviewDefinition = {
  id: string;
  name: string;
  subject: string;
  description: string;
  html: string;
  text: string;
};

function previewLayout(
  title: string,
  bodyHtml: string,
  options?: {
    preheader?: string;
    primaryAction?: { label: string; href: string };
    securityNotice?: string;
  },
) {
  return buildEmailLayout({
    title,
    preheader: options?.preheader,
    bodyHtml,
    appUrl: APP_URL,
    primaryAction: options?.primaryAction,
    securityNotice: options?.securityNotice,
  });
}

export function getEmailPreviewDefinitions(): EmailPreviewDefinition[] {
  const fullName = "Avery Morgan";
  const email = "avery.morgan@example.com";

  return [
    {
      id: "welcome",
      name: "Welcome / registration",
      subject: "Welcome to Bluewave Credit Union",
      description: "Sent when a new member completes registration.",
      html: previewLayout(
        "Welcome to Bluewave",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>Thank you for choosing Bluewave Credit Union. Your membership request has been received and is pending review by our member services team.</p>
         <p>We will notify you when your account is ready for full online banking access.</p>`,
        {
          preheader: "Your Bluewave membership request was received.",
          primaryAction: { label: "View membership status", href: "/dashboard" },
        },
      ),
      text: buildEmailText(
        "Welcome to Bluewave",
        `Hi ${fullName},\n\nThank you for choosing Bluewave Credit Union. Your membership request has been received and is pending review.`,
        APP_URL,
      ),
    },
    {
      id: "account-status",
      name: "Account status update",
      subject: "Your Bluewave membership is active",
      description: "Sent when operations approves or updates membership status.",
      html: previewLayout(
        "Membership status updated",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>Your Bluewave membership status is now <strong>Active</strong>.</p>
         <p>You can sign in to manage accounts, move money, pay bills, and review statements.</p>`,
        {
          primaryAction: { label: "Sign in to online banking", href: "/auth" },
        },
      ),
      text: buildEmailText(
        "Membership status updated",
        `Hi ${fullName},\n\nYour Bluewave membership status is now Active.`,
        APP_URL,
      ),
    },
    {
      id: "login-alert",
      name: "Sign-in alert",
      subject: "New sign-in to your Bluewave account",
      description: "Sent after a successful sign-in to online banking.",
      html: previewLayout(
        "Sign-in alert",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>A new sign-in to your Bluewave account was detected on <strong>May 30, 2026 at 2:14 PM CT</strong>.</p>
         <p>If this was you, no action is needed. If you do not recognize this activity, contact member services immediately.</p>`,
        {
          securityNotice:
            "Bluewave will never ask you to share your password, verification codes, or full card numbers by email or phone.",
          primaryAction: { label: "Review security settings", href: "/member/security" },
        },
      ),
      text: buildEmailText(
        "Sign-in alert",
        `Hi ${fullName},\n\nA new sign-in to your Bluewave account was detected.`,
        APP_URL,
      ),
    },
    {
      id: "password-changed",
      name: "Password changed",
      subject: "Your Bluewave password was updated",
      description: "Sent after a successful password change in Settings.",
      html: previewLayout(
        "Password updated",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>The password for your Bluewave online banking profile was changed successfully.</p>
         <p>If you did not make this change, contact member services immediately so we can secure your account.</p>`,
        {
          securityNotice:
            "Never share your password or one-time verification codes with anyone, including Bluewave staff.",
          primaryAction: { label: "Contact member services", href: "/support" },
        },
      ),
      text: buildEmailText(
        "Password updated",
        `Hi ${fullName},\n\nThe password for your Bluewave online banking profile was changed successfully.`,
        APP_URL,
      ),
    },
    {
      id: "transfer-created",
      name: "Transfer submitted",
      subject: "Transfer request submitted for review",
      description: "Sent when a member submits a transfer for operations review.",
      html: previewLayout(
        "Transfer request submitted",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>Your transfer request for <strong>${formatEmailCurrency(250)}</strong> has been submitted and is pending review.</p>
         <p><strong>Reference:</strong> TRX-20260530-001</p>
         <p><strong>Details:</strong> Transfer to Share Savings · Ending 5702</p>
         <p>Account balances remain unchanged until the request is reviewed and posted.</p>`,
        { primaryAction: { label: "View transfers", href: "/transfers" } },
      ),
      text: buildEmailText(
        "Transfer request submitted",
        `Hi ${fullName},\n\nYour transfer request for ${formatEmailCurrency(250)} is pending review.`,
        APP_URL,
      ),
    },
    {
      id: "transfer-approved",
      name: "Transfer approved",
      subject: "Transfer request approved",
      description: "Sent when operations approves and posts a transfer.",
      html: previewLayout(
        "Transfer request approved",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>Your transfer request <strong>TRX-20260530-001</strong> for <strong>${formatEmailCurrency(250)}</strong> has been <strong>approved</strong>.</p>
         <p>Balances have been updated after ledger posting.</p>`,
        { primaryAction: { label: "View activity", href: "/transactions" } },
      ),
      text: buildEmailText(
        "Transfer request approved",
        `Hi ${fullName},\n\nYour transfer TRX-20260530-001 was approved.`,
        APP_URL,
      ),
    },
    {
      id: "bill-payment-created",
      name: "Bill payment saved",
      subject: "Bill payment saved",
      description: "Sent when a bill payment is saved for review.",
      html: previewLayout(
        "Bill payment saved",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>Your bill payment to <strong>City Utilities</strong> for <strong>${formatEmailCurrency(142.18)}</strong> was saved.</p>
         <p>Status: <strong>Pending review</strong>. Bill payments are submitted for review before posting.</p>`,
        { primaryAction: { label: "View bill pay", href: "/bill-pay" } },
      ),
      text: buildEmailText(
        "Bill payment saved",
        `Hi ${fullName},\n\nYour bill payment to City Utilities was saved for review.`,
        APP_URL,
      ),
    },
    {
      id: "bill-payment-posted",
      name: "Bill payment posted",
      subject: "Bill payment posted",
      description: "Sent when operations posts an approved bill payment.",
      html: previewLayout(
        "Bill payment posted",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>Your bill payment to <strong>City Utilities</strong> for <strong>${formatEmailCurrency(142.18)}</strong> is now <strong>Posted</strong>.</p>
         <p><strong>Reference:</strong> BP-20260530-004</p>
         <p>Balances were updated after operations approval and ledger posting.</p>`,
        { primaryAction: { label: "View bill pay history", href: "/bill-pay" } },
      ),
      text: buildEmailText(
        "Bill payment posted",
        `Hi ${fullName},\n\nYour bill payment to City Utilities was posted.`,
        APP_URL,
      ),
    },
    {
      id: "payee-added",
      name: "Payee added",
      subject: "Payee added to your account",
      description: "Sent when a member adds a new bill pay recipient.",
      html: previewLayout(
        "Payee added",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p><strong>City Utilities</strong> was added to your Bluewave payee list.</p>
         <p>If you did not add this payee, contact member services immediately.</p>`,
        { primaryAction: { label: "Manage payees", href: "/payees" } },
      ),
      text: buildEmailText("Payee added", `Hi ${fullName},\n\nCity Utilities was added to your payee list.`, APP_URL),
    },
    {
      id: "support-created",
      name: "Support ticket received",
      subject: "Support ticket received",
      description: "Sent when a signed-in member opens a support ticket.",
      html: previewLayout(
        "Support ticket received",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>We received your support request and our member services team will review it shortly.</p>
         <p><strong>Subject:</strong> Unable to view recent transfer</p>
         <p><strong>Ticket ID:</strong> SUP-20260530-019</p>`,
        { primaryAction: { label: "View support tickets", href: "/member/support" } },
      ),
      text: buildEmailText(
        "Support ticket received",
        `Hi ${fullName},\n\nWe received your support ticket SUP-20260530-019.`,
        APP_URL,
      ),
    },
    {
      id: "support-updated",
      name: "Support ticket update",
      subject: "Support ticket update",
      description: "Sent when operations updates a support ticket status.",
      html: previewLayout(
        "Support ticket updated",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>Your support ticket has been updated.</p>
         <p><strong>Subject:</strong> Unable to view recent transfer</p>
         <p><strong>Status:</strong> Resolved</p>
         <p><strong>Ticket ID:</strong> SUP-20260530-019</p>`,
        { primaryAction: { label: "Open support", href: "/member/support" } },
      ),
      text: buildEmailText(
        "Support ticket updated",
        `Hi ${fullName},\n\nYour support ticket is now Resolved.`,
        APP_URL,
      ),
    },
    {
      id: "contact-confirmation",
      name: "Contact form confirmation",
      subject: "We received your message",
      description: "Sent to visitors who submit the public contact form.",
      html: previewLayout(
        "Message received",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>Thank you for contacting Bluewave Credit Union. We received your message regarding <strong>Account support</strong>.</p>
         <p><strong>Reference:</strong> BW-A1B2C3D4</p>
         <p>A member services representative will respond using the email address you provided.</p>`,
        { primaryAction: { label: "Visit Bluewave", href: "/" } },
      ),
      text: buildEmailText(
        "Message received",
        `Hi ${fullName},\n\nWe received your contact form message. Reference: BW-A1B2C3D4`,
        APP_URL,
      ),
    },
    {
      id: "dispute-created",
      name: "Dispute submitted",
      subject: "Dispute submitted",
      description: "Sent when a member files a transaction dispute.",
      html: previewLayout(
        "Dispute submitted",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>We received your dispute for transaction <strong>TRX-20260512-884</strong>.</p>
         <p><strong>Reason:</strong> Unauthorized charge</p>
         <p>Submitting a dispute does not automatically reverse a transaction while our team reviews your claim.</p>`,
        { primaryAction: { label: "View disputes", href: "/disputes" } },
      ),
      text: buildEmailText(
        "Dispute submitted",
        `Hi ${fullName},\n\nWe received your dispute for transaction TRX-20260512-884.`,
        APP_URL,
      ),
    },
    {
      id: "dispute-updated",
      name: "Dispute update",
      subject: "Dispute under review",
      description: "Sent when operations updates dispute status.",
      html: previewLayout(
        "Dispute update",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>Your dispute for <strong>TRX-20260512-884</strong> is now <strong>Under review</strong>.</p>
         <p>Our team is investigating the claim and will contact you if additional information is needed.</p>`,
        { primaryAction: { label: "View disputes", href: "/disputes" } },
      ),
      text: buildEmailText(
        "Dispute update",
        `Hi ${fullName},\n\nYour dispute is now Under review.`,
        APP_URL,
      ),
    },
    {
      id: "kyc-status",
      name: "Identity verification update",
      subject: "KYC review approved",
      description: "Sent when KYC / identity verification status changes.",
      html: previewLayout(
        "Identity verification update",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>Your identity verification status is now <strong>Approved</strong>.</p>
         <p>Visit your profile page to review details or update your information if anything has changed.</p>`,
        { primaryAction: { label: "View profile", href: "/profile" } },
      ),
      text: buildEmailText(
        "Identity verification update",
        `Hi ${fullName},\n\nYour identity verification status is now Approved.`,
        APP_URL,
      ),
    },
    {
      id: "adjustment-posted",
      name: "Balance adjustment",
      subject: "Balance adjustment posted",
      description: "Sent when operations posts a controlled balance adjustment.",
      html: previewLayout(
        "Balance adjustment posted",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>A controlled <strong>credit</strong> adjustment of <strong>${formatEmailCurrency(25)}</strong> was posted to your account.</p>
         <p><strong>Reference:</strong> ADJ-20260530-002</p>`,
        { primaryAction: { label: "View accounts", href: "/accounts" } },
      ),
      text: buildEmailText(
        "Balance adjustment posted",
        `Hi ${fullName},\n\nA credit adjustment of ${formatEmailCurrency(25)} was posted.`,
        APP_URL,
      ),
    },
    {
      id: "admin-alert",
      name: "Operations alert",
      subject: "[Bluewave Admin] New member registration",
      description: "Sent to the operations inbox for high-priority events.",
      html: previewLayout(
        "New member registration",
        `<p>A new member registration requires review.</p>
         <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
         <p><strong>Email:</strong> ${escapeHtml(email)}</p>
         <p>Sign in to the operations console to review membership status and KYC.</p>`,
        { primaryAction: { label: "Open operations console", href: "/lex/auth" } },
      ),
      text: buildEmailText(
        "New member registration",
        `A new member registration requires review.\n\nName: ${fullName}\nEmail: ${email}`,
        APP_URL,
      ),
    },
  ];
}

export function getEmailPreviewById(id: string) {
  return getEmailPreviewDefinitions().find((preview) => preview.id === id) ?? null;
}

export function getEmailPreviewAppUrl() {
  return getEmailAppUrl();
}

export function getEmailPreviewFooter() {
  return buildEmailPlainTextFooter(APP_URL);
}
