import { LoansClient } from "@/components/dashboard/LoansClient";
import { AppShell } from "@/components/layout/AppShell";

export default function LoansPage() {
  return (
    <AppShell
      title="Loans"
      subtitle="A lending center foundation prepared against authenticated loan records."
    >
      <LoansClient />
    </AppShell>
  );
}
