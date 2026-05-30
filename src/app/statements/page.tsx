import { AppShell } from "@/components/layout/AppShell";
import { StatementsClient } from "@/components/statements/StatementsClient";

export default function StatementsPage() {
  return (
    <AppShell
      title="Statements"
      subtitle="Download monthly account statements in CSV or PDF format."
    >
      <StatementsClient />
    </AppShell>
  );
}
