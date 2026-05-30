import { AppShell } from "@/components/layout/AppShell";
import { DisputesClient } from "@/components/disputes/DisputesClient";

export default function DisputesPage() {
  return (
    <AppShell
      title="Disputes"
      subtitle="Review and submit transaction disputes for team review."
    >
      <DisputesClient />
    </AppShell>
  );
}
