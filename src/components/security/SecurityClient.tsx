"use client";

import Link from "next/link";
import { InfoPanel } from "@/components/ui/InfoPanel";
import { SessionsClient } from "@/components/security/SessionsClient";
import { MEMBER_SUPPORT_PATH } from "@/lib/memberRoutes";

export function SecurityClient() {
  return (
    <section className="grid gap-5">
      <InfoPanel title="Login alerts" variant="brand">
        Bluewave sends login alerts when email delivery is configured. Review active sessions
        regularly and revoke unfamiliar devices.
      </InfoPanel>

      <InfoPanel title="Password change">
        Password change from the member portal is coming soon. Contact{" "}
        <Link href={MEMBER_SUPPORT_PATH} className="font-semibold text-royal-blue">
          member support
        </Link>{" "}
        if you need immediate help.
      </InfoPanel>

      <SessionsClient />
    </section>
  );
}
