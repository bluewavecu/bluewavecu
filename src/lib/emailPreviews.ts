import {
  DEMO_MEMBER_ADDRESS,
  DEMO_MEMBER_FULL_NAME,
  DEMO_MEMBER_PHONE,
  DEMO_USER_EMAIL,
  formatDemoMemberAddress,
} from "@/lib/bootstrapAccounts";
import { INSTITUTION } from "@/lib/institution";
import {
  buildEmailDetailsBlock,
  buildEmailDetailsPlainText,
  buildEmailLayout,
  buildEmailPlainTextFooter,
  buildEmailText,
  escapeHtml,
  formatEmailCurrency,
  getEmailAppUrl,
} from "@/lib/emailTemplate";

export type EmailPreviewDefinition = {
  id: string;
  name: string;
  subject: string;
  description: string;
  html: string;
  text: string;
};

function previewLayout(
  appUrl: string,
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
    appUrl,
    primaryAction: options?.primaryAction,
    securityNotice: options?.securityNotice,
  });
}

export function getEmailPreviewDefinitions(): EmailPreviewDefinition[] {
  const appUrl = getEmailAppUrl();
  const fullName = DEMO_MEMBER_FULL_NAME;
  const email = DEMO_USER_EMAIL;
  const memberPhone = DEMO_MEMBER_PHONE;
  const memberAddress = formatDemoMemberAddress(DEMO_MEMBER_ADDRESS);

  return [
    {
      id: "welcome",
      name: "Welcome / registration",
      subject: "Welcome to Bluewave Credit Union",
      description: "Sent when a new member completes registration.",
      html: previewLayout(
        appUrl,
        "Welcome to Bluewave",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>Thank you for choosing Bluewave Credit Union. Your membership request has been received and is pending review by our member services team.</p>
         <p>We will notify you when your account is ready for full online banking access.</p>`,
        {
          preheader: "Your Bluewave membership request was received.",
          primaryAction: { label: "Sign in to online banking", href: "/auth/login" },
        },
      ),
      text: buildEmailText(
        "Welcome to Bluewave",
        `Hi ${fullName},\n\nThank you for choosing Bluewave Credit Union. Your membership request has been received and is pending review.`,
        appUrl,
      ),
    },
    {
      id: "account-status",
      name: "Account status update",
      subject: "Your Bluewave membership is active",
      description: "Sent when operations approves or updates membership status.",
      html: previewLayout(
        appUrl,
        "Membership status updated",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>Your Bluewave membership status is now <strong>Active</strong>.</p>
         <p>You can sign in to manage accounts, move money, pay bills, and review statements.</p>`,
        {
          primaryAction: { label: "Sign in to online banking", href: "/auth/login" },
        },
      ),
      text: buildEmailText(
        "Membership status updated",
        `Hi ${fullName},\n\nYour Bluewave membership status is now Active.`,
        appUrl,
      ),
    },
    {
      id: "login-alert",
      name: "Sign-in alert",
      subject: "New sign-in to your Bluewave account",
      description: "Sent after a successful sign-in to online banking.",
      html: previewLayout(
        appUrl,
        "Sign-in alert",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>A new sign-in to your Bluewave account was detected on <strong>May 30, 2026 at 2:14 PM CT</strong>.</p>
         <p>If this was you, no action is needed. If you do not recognize this activity, contact member services immediately.</p>`,
        {
          securityNotice:
            "Bluewave will never ask you to share your password, verification codes, or full card numbers by email or phone.",
          primaryAction: { label: "Review security settings", href: "/auth/security" },
        },
      ),
      text: buildEmailText(
        "Sign-in alert",
        `Hi ${fullName},\n\nA new sign-in to your Bluewave account was detected.`,
        appUrl,
      ),
    },
    {
      id: "password-changed",
      name: "Password changed",
      subject: "Your Bluewave password was updated",
      description: "Sent after a successful password change in Settings.",
      html: previewLayout(
        appUrl,
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
        appUrl,
      ),
    },
    {
      id: "password-reset",
      name: "Password reset",
      subject: "Reset your Bluewave password",
      description: "Sent when a member requests a password reset link and verification code.",
      html: previewLayout(
        appUrl,
        "Reset your password",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>We received a request to reset the password for your Bluewave online banking account.</p>
         <p>Choose a new password using the button below, or enter this verification code on the reset page:</p>
         <p style="margin: 24px 0; font-size: 28px; font-weight: 700; letter-spacing: 0.24em; color: #0A2A5E;">482913</p>
         <p>This link and code expire in 30 minutes. If you did not request a password reset, you can ignore this email — your password will stay the same.</p>`,
        {
          preheader: "Use the link or verification code below to choose a new password.",
          primaryAction: {
            label: "Choose a new password",
            href: "/auth/reset-password?token=preview-token",
          },
          securityNotice:
            "Never share your password or verification code with anyone, including Bluewave staff.",
        },
      ),
      text: buildEmailText(
        "Reset your password",
        `Hi ${fullName},\n\nWe received a request to reset your Bluewave password.\n\nReset link: ${appUrl}/auth/reset-password?token=preview-token\n\nVerification code: 482913\n\nThis link and code expire in 30 minutes.`,
        appUrl,
      ),
    },
    {
      id: "transfer-created",
      name: "Transfer submitted",
      subject: "We received your transfer",
      description: "Sent when a member submits a transfer for review.",
      html: previewLayout(
        appUrl,
        "We're reviewing your transfer",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>We received your transfer of <strong>${formatEmailCurrency(250)}</strong> and are reviewing it now.</p>
         <p><strong>Reference:</strong> TRX-20260530-001</p>
         <p><strong>Details:</strong> Transfer to Share Savings · Ending 5702</p>
         <p>Your balance won't change until we finish our review.</p>`,
        { primaryAction: { label: "View transfers", href: "/auth/transfers" } },
      ),
      text: buildEmailText(
        "We're reviewing your transfer",
        `Hi ${fullName},\n\nWe received your transfer of ${formatEmailCurrency(250)} (TRX-20260530-001). We're reviewing it now and will email you when it's complete.`,
        appUrl,
      ),
    },
    {
      id: "transfer-approved",
      name: "Transfer approved",
      subject: "Your transfer was approved",
      description: "Sent when operations approves a transfer.",
      html: previewLayout(
        appUrl,
        "Your transfer was approved",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>Good news — your transfer <strong>TRX-20260530-001</strong> for <strong>${formatEmailCurrency(250)}</strong> was approved.</p>
         <p>The money has been sent and your balance is updated.</p>`,
        { primaryAction: { label: "View activity", href: "/auth/transactions" } },
      ),
      text: buildEmailText(
        "Your transfer was approved",
        `Hi ${fullName},\n\nYour transfer of ${formatEmailCurrency(250)} (TRX-20260530-001) was approved. The money has been sent and your balance is updated.`,
        appUrl,
      ),
    },
    {
      id: "bill-payment-created",
      name: "Bill payment saved",
      subject: "Bill payment saved",
      description: "Sent when a bill payment is saved for review.",
      html: previewLayout(
        appUrl,
        "Bill payment saved",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>We've saved your bill payment to <strong>Oncor Electric Delivery</strong> for <strong>${formatEmailCurrency(142.18)}</strong>.</p>
         <p>We're reviewing it now and will email you when it's complete.</p>`,
        { primaryAction: { label: "View bill pay", href: "/auth/bill-pay" } },
      ),
      text: buildEmailText(
        "Bill payment saved",
        `Hi ${fullName},\n\nYour bill payment to Oncor Electric Delivery was saved for review.`,
        appUrl,
      ),
    },
    {
      id: "bill-payment-posted",
      name: "Bill payment posted",
      subject: "Bill payment posted",
      description: "Sent when operations posts an approved bill payment.",
      html: previewLayout(
        appUrl,
        "Bill payment posted",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>Your bill payment to <strong>Oncor Electric Delivery</strong> for <strong>${formatEmailCurrency(142.18)}</strong> is now <strong>Posted</strong>.</p>
         <p><strong>Reference:</strong> BP-20260530-004</p>
         <p>The payment has been sent and your balance is updated.</p>`,
        { primaryAction: { label: "View bill pay history", href: "/auth/bill-pay" } },
      ),
      text: buildEmailText(
        "Bill payment posted",
        `Hi ${fullName},\n\nYour bill payment to Oncor Electric Delivery was posted.`,
        appUrl,
      ),
    },
    {
      id: "payee-added",
      name: "Payee added",
      subject: "Payee added to your account",
      description: "Sent when a member adds a new bill pay recipient.",
      html: previewLayout(
        appUrl,
        "Payee added",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p><strong>Oncor Electric Delivery</strong> was added to your Bluewave payee list.</p>
         <p>If you did not add this payee, contact member services immediately.</p>`,
        { primaryAction: { label: "Manage payees", href: "/auth/payees" } },
      ),
      text: buildEmailText("Payee added", `Hi ${fullName},\n\nOncor Electric Delivery was added to your payee list.`, appUrl),
    },
    {
      id: "support-created",
      name: "Support ticket received",
      subject: "Support ticket received",
      description: "Sent when a signed-in member opens a support ticket.",
      html: previewLayout(
        appUrl,
        "Support ticket received",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>We received your support request and our member services team will review it shortly.</p>
         <p><strong>Subject:</strong> Unable to view recent transfer</p>
         <p><strong>Ticket ID:</strong> SUP-20260530-019</p>`,
        { primaryAction: { label: "View support tickets", href: "/auth/support" } },
      ),
      text: buildEmailText(
        "Support ticket received",
        `Hi ${fullName},\n\nWe received your support ticket SUP-20260530-019.`,
        appUrl,
      ),
    },
    {
      id: "support-updated",
      name: "Support ticket update",
      subject: "Support ticket update",
      description: "Sent when operations updates a support ticket status.",
      html: previewLayout(
        appUrl,
        "Support ticket updated",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>Your support ticket has been updated.</p>
         <p><strong>Subject:</strong> Unable to view recent transfer</p>
         <p><strong>Status:</strong> Resolved</p>
         <p><strong>Ticket ID:</strong> SUP-20260530-019</p>`,
        { primaryAction: { label: "Open support", href: "/auth/support" } },
      ),
      text: buildEmailText(
        "Support ticket updated",
        `Hi ${fullName},\n\nYour support ticket is now Resolved.`,
        appUrl,
      ),
    },
    {
      id: "contact-confirmation",
      name: "Contact form confirmation",
      subject: "We received your message — Business banking",
      description: "Sent to visitors who submit the public contact form.",
      html: previewLayout(
        appUrl,
        "We received your message",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>Thank you for contacting Bluewave Credit Union about <strong>Business banking</strong>. We received your message and a member services representative will reply using the email address you provided.</p>
         <p>Keep the details below for your records:</p>
         ${buildEmailDetailsBlock([
           { label: "Reference", value: "BW-A1B2C3D4" },
           { label: "Topic", value: "Business banking" },
           { label: "Message", value: "I would like to learn more about business checking and merchant services." },
           { label: "Name", value: fullName },
           { label: "Email", value: email },
           { label: "Phone", value: memberPhone },
           { label: "Submitted", value: "Saturday, May 30, 2026 at 2:15 PM" },
         ])}
         <p>Typical response time is one business day during ${INSTITUTION.memberServicesHoursShort}.</p>`,
        {
          preheader: "We received your business banking message — reference BW-A1B2C3D4.",
          primaryAction: { label: "Visit member support", href: "/support" },
        },
      ),
      text: buildEmailText(
        "We received your message",
        `Hi ${fullName},\n\nThank you for contacting Bluewave Credit Union about Business banking.\n\n${buildEmailDetailsPlainText([
          { label: "Reference", value: "BW-A1B2C3D4" },
          { label: "Topic", value: "Business banking" },
          { label: "Message", value: "I would like to learn more about business checking and merchant services." },
          { label: "Name", value: fullName },
          { label: "Email", value: email },
          { label: "Phone", value: memberPhone },
          { label: "Submitted", value: "Saturday, May 30, 2026 at 2:15 PM" },
        ])}`,
        appUrl,
      ),
    },
    {
      id: "contact-form-admin",
      name: "Contact form admin alert",
      subject: "[Bluewave Admin] Contact form: Business banking — Avery Morgan",
      description: "Sent to the operations inbox when a visitor submits the public contact form.",
      html: previewLayout(
        appUrl,
        "New contact form message",
        `<p><strong>${escapeHtml(fullName)}</strong> sent a new contact form message about <strong>Business banking</strong>.</p>
         <p>Review the message below, then reply directly to <a href="mailto:${escapeHtml(email)}" style="color: #0D47A1; text-decoration: none; font-weight: 700;">${escapeHtml(email)}</a>.</p>
         ${buildEmailDetailsBlock([
           { label: "Topic", value: "Business banking" },
           { label: "Reference", value: "BW-A1B2C3D4" },
           { label: "Submitted", value: "Saturday, May 30, 2026 at 2:15 PM" },
           { label: "From", value: fullName },
           { label: "Email", value: email },
           { label: "Phone", value: memberPhone },
           { label: "Message", value: "I would like to learn more about business checking and merchant services." },
         ])}`,
        {
          preheader: `Business banking message from ${fullName} — reply to ${email}.`,
          primaryAction: { label: "Open operations console", href: "/lex/auth" },
        },
      ),
      text: buildEmailText(
        "New contact form message",
        `${fullName} sent a message about Business banking.\n\n${buildEmailDetailsPlainText([
          { label: "Topic", value: "Business banking" },
          { label: "Reference", value: "BW-A1B2C3D4" },
          { label: "Submitted", value: "Saturday, May 30, 2026 at 2:15 PM" },
          { label: "From", value: fullName },
          { label: "Email", value: email },
          { label: "Phone", value: memberPhone },
          { label: "Message", value: "I would like to learn more about business checking and merchant services." },
        ])}\n\nReply to: ${email}`,
        appUrl,
      ),
    },
    {
      id: "dispute-created",
      name: "Dispute submitted",
      subject: "Dispute submitted",
      description: "Sent when a member files a transaction dispute.",
      html: previewLayout(
        appUrl,
        "Dispute submitted",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>We received your dispute for transaction <strong>TRX-20260512-884</strong>.</p>
         <p><strong>Reason:</strong> Unauthorized charge</p>
         <p>Submitting a dispute does not automatically reverse a transaction while our team reviews your claim.</p>`,
        { primaryAction: { label: "View disputes", href: "/auth/disputes" } },
      ),
      text: buildEmailText(
        "Dispute submitted",
        `Hi ${fullName},\n\nWe received your dispute for transaction TRX-20260512-884.`,
        appUrl,
      ),
    },
    {
      id: "dispute-updated",
      name: "Dispute update",
      subject: "Dispute under review",
      description: "Sent when operations updates dispute status.",
      html: previewLayout(
        appUrl,
        "Dispute update",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>Your dispute for <strong>TRX-20260512-884</strong> is now <strong>Under review</strong>.</p>
         <p>Our team is investigating the claim and will contact you if additional information is needed.</p>`,
        { primaryAction: { label: "View disputes", href: "/auth/disputes" } },
      ),
      text: buildEmailText(
        "Dispute update",
        `Hi ${fullName},\n\nYour dispute is now Under review.`,
        appUrl,
      ),
    },
    {
      id: "kyc-status",
      name: "Identity verification update",
      subject: "KYC review approved",
      description: "Sent when KYC / identity verification status changes.",
      html: previewLayout(
        appUrl,
        "Identity verification update",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>Your identity verification status is now <strong>Approved</strong>.</p>
         <p>Visit your profile page to review details or update your information if anything has changed.</p>`,
        { primaryAction: { label: "View profile", href: "/auth/profile" } },
      ),
      text: buildEmailText(
        "Identity verification update",
        `Hi ${fullName},\n\nYour identity verification status is now Approved.`,
        appUrl,
      ),
    },
    {
      id: "adjustment-posted",
      name: "Account credit",
      subject: "Your account was updated",
      description: "Sent when a credit or debit is posted to a member account.",
      html: previewLayout(
        appUrl,
        "Your account was updated",
        `<p>Hi ${escapeHtml(fullName)},</p>
         <p>You have been credited <strong>${formatEmailCurrency(25)}</strong>, which has been posted to your account.</p>
         <p><strong>Reference:</strong> ADJ-20260530-002</p>`,
        { primaryAction: { label: "View accounts", href: "/auth/accounts" } },
      ),
      text: buildEmailText(
        "Your account was updated",
        `Hi ${fullName},\n\nYou have been credited ${formatEmailCurrency(25)}, which has been posted to your account.\n\nReference: ADJ-20260530-002`,
        appUrl,
      ),
    },
    {
      id: "admin-alert",
      name: "New membership application",
      subject: "[Bluewave Admin] New membership application — Avery Morgan",
      description: "Sent to operations when a new member completes enrollment.",
      html: previewLayout(
        appUrl,
        "New membership application",
        `<p><strong>${escapeHtml(fullName)}</strong> submitted a new membership application.</p>
         <p>Review the applicant details below, then sign in to the operations console to approve or follow up.</p>
         ${buildEmailDetailsBlock([
           { label: "Status", value: "Pending review" },
           { label: "Applicant", value: fullName },
           { label: "Email", value: email },
           { label: "Phone", value: memberPhone },
           { label: "Date of birth", value: "1990-04-12" },
           { label: "Occupation", value: "Software engineer" },
           {
             label: "Address",
             value: memberAddress,
           },
         ])}`,
        {
          preheader: `${fullName} submitted a membership application — pending review.`,
          primaryAction: { label: "Open operations console", href: "/lex/auth" },
        },
      ),
      text: buildEmailText(
        "New membership application",
        `${fullName} submitted a new membership application.\n\nStatus: Pending review\nApplicant: ${fullName}\nEmail: ${email}\nPhone: ${memberPhone}\nDate of birth: 1990-04-12\nOccupation: Software engineer\nAddress:\n${memberAddress}`,
        appUrl,
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
  return buildEmailPlainTextFooter(getEmailAppUrl());
}
