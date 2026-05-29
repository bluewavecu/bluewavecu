import { TransactionsClient } from "@/components/dashboard/TransactionsClient";
import { AppShell } from "@/components/layout/AppShell";

export default function TransactionsPage() {
  return (
    <AppShell
      title="Transactions"
      subtitle="A transaction history foundation prepared against authenticated dashboard activity."
    >
      <TransactionsClient />
    </AppShell>
  );
}
