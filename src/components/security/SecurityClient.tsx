"use client";

import Link from "next/link";
import { InfoPanel } from "@/components/ui/InfoPanel";
import { SessionsClient } from "@/components/security/SessionsClient";
import { FORGOT_PASSWORD_PATH } from "@/lib/authRoutes";
import { MEMBER_FORGOT_TRANSACTION_PIN_PATH } from "@/lib/memberRoutes";

export function SecurityClient() {
  return (
    <section className="grid gap-5">
      <InfoPanel title="Login alerts" variant="brand">
        Bluewave sends login alerts when email delivery is configured. Review active sessions
        regularly and revoke unfamiliar devices.
      </InfoPanel>

      <InfoPanel title="Forgot your password?">
        If you are signed out and need to recover access,{" "}
        <Link href={FORGOT_PASSWORD_PATH} className="font-semibold text-royal-blue">
          request password reset instructions
        </Link>
        . We will email you a secure link and verification code.
      </InfoPanel>

      <InfoPanel title="Forgot your transaction PIN?">
        Reset your 6-digit transaction PIN with a one-time email verification code.{" "}
        <Link href={MEMBER_FORGOT_TRANSACTION_PIN_PATH} className="font-semibold text-royal-blue">
          Reset transaction PIN
        </Link>
        .
      </InfoPanel>

      <SessionsClient />
    </section>
  );
}
