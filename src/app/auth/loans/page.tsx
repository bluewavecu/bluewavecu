import { AppShell } from "@/components/layout/AppShell";
import { LoansClient } from "@/components/loans/LoansClient";

export default function MemberLoansPage() {
  return (
    <AppShell
      title="Loans"
      subtitle="Review active loans, explore offers, and submit application requests for specialist review."
    >
      <LoansClient />
    </AppShell>
  );
}
