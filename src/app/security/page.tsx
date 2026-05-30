import { AppShell } from "@/components/layout/AppShell";
import { SessionsClient } from "@/components/security/SessionsClient";

export default function SecurityPage() {
  return (
    <AppShell
      title="Security"
      subtitle="Manage active sessions, MFA preferences, and account security settings."
    >
      <SessionsClient />
    </AppShell>
  );
}
