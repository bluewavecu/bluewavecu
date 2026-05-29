import { SupportClient } from "@/components/dashboard/SupportClient";
import { AppShell } from "@/components/layout/AppShell";

export default function SupportPage() {
  return (
    <AppShell
      title="Support"
      subtitle="Support inbox, contact paths, and secure message placeholders backed by authenticated summary data."
    >
      <SupportClient />
    </AppShell>
  );
}
