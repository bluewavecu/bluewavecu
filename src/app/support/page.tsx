import { SupportClient } from "@/components/support/SupportClient";
import { AppShell } from "@/components/layout/AppShell";

export default function SupportPage() {
  return (
    <AppShell
      title="Support"
      subtitle="Review support tickets, submit new requests, and contact Bluewave member support."
    >
      <SupportClient />
    </AppShell>
  );
}
