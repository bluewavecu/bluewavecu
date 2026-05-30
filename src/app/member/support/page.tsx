import { AppShell } from "@/components/layout/AppShell";
import { SupportClient } from "@/components/support/SupportClient";

export default function MemberSupportPage() {
  return (
    <AppShell
      title="Support"
      subtitle="Create tickets, track responses, and contact Bluewave member services."
    >
      <SupportClient />
    </AppShell>
  );
}
