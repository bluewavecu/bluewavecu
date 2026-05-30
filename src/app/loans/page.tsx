import { LoansClient } from "@/components/loans/LoansClient";
import { AppShell } from "@/components/layout/AppShell";

export default function LoansPage() {
  return (
    <AppShell
      title="Loans"
      subtitle="Review active loans, demo pre-qualification offers, and payment estimates."
    >
      <LoansClient />
    </AppShell>
  );
}
