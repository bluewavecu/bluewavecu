import { AppShell } from "@/components/layout/AppShell";
import { PayeesClient } from "@/components/payees/PayeesClient";

export default function PayeesPage() {
  return (
    <AppShell title="Recipients" subtitle="Create and manage bill pay recipients.">
      <PayeesClient />
    </AppShell>
  );
}
