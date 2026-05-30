import { AppShell } from "@/components/layout/AppShell";
import { SecurityClient } from "@/components/security/SecurityClient";

export default function MemberSecurityPage() {
  return (
    <AppShell
      title="Security"
      subtitle="Manage sessions, MFA preferences, and review security activity."
    >
      <SecurityClient />
    </AppShell>
  );
}
