import { TransactionsClient } from "@/components/transactions/TransactionsClient";
import { AppShell } from "@/components/layout/AppShell";

export default function TransactionsPage() {
  return (
    <AppShell
      title="Transactions"
      subtitle="Filter and review authenticated transaction history across your accounts."
    >
      <TransactionsClient />
    </AppShell>
  );
}
