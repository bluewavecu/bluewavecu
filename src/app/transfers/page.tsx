import { TransfersClient } from "@/components/transfers/TransfersClient";
import { AppShell } from "@/components/layout/AppShell";

export default function TransfersPage() {
  return (
    <AppShell
      title="Transfers"
      subtitle="Submit pending transfer requests without moving real account balances."
    >
      <TransfersClient />
    </AppShell>
  );
}
