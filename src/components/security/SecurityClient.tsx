"use client";

import Link from "next/link";
import { InfoPanel } from "@/components/ui/InfoPanel";
import { SessionsClient } from "@/components/security/SessionsClient";
import { FORGOT_PASSWORD_PATH } from "@/lib/authRoutes";

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

      <SessionsClient />
    </section>
  );
}
