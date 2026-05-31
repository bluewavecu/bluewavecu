import { TransfersClient } from "@/components/transfers/TransfersClient";
import { AppShell } from "@/components/layout/AppShell";

export default function TransfersPage() {
  return (
    <AppShell
      title="Transfers"
      subtitle="Move money between your accounts and to other members. Transfers are reviewed before posting."
    >
      <TransfersClient />
    </AppShell>
  );
}
