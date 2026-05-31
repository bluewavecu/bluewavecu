import { AppShell } from "@/components/layout/AppShell";
import { StatementsClient } from "@/components/statements/StatementsClient";

export default function StatementsPage() {
  return (
    <AppShell title="Statements" subtitle="CSV or PDF by account and month." hideHeaderSearch>
      <StatementsClient />
    </AppShell>
  );
}
