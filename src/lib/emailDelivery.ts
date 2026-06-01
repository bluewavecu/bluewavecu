import type { EmailSendResult } from "@/lib/email";
import { INSTITUTION } from "@/lib/institution";

export const MEMBER_EMAIL_DELIVERY_ERROR =
  "We couldn't send email right now. Wait a moment and tap Resend code, or contact member services.";

export function emailWasDelivered(result: EmailSendResult) {
  return result.ok && result.mode !== "logged";
}

export function getMemberEmailDeliveryError(result: EmailSendResult) {
  if (result.ok) {
    return "";
  }

  if (result.mode === "not_configured") {
    return `Email delivery is temporarily unavailable. Contact ${INSTITUTION.email} for help completing verification.`;
  }

  return result.error || MEMBER_EMAIL_DELIVERY_ERROR;
}
