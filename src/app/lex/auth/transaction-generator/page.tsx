import { AdminShell } from "@/components/admin/AdminShell";
import { AdminTransactionGeneratorClient } from "@/components/admin/AdminTransactionGeneratorClient";

export default function AdminTransactionGeneratorPage() {
  return (
    <AdminShell
      title="Generate Transactions"
      subtitle="Bulk-create posted credits and debits with balanced ledger entries."
    >
      <AdminTransactionGeneratorClient />
    </AdminShell>
  );
}
