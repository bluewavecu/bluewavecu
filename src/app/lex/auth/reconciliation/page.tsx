import { AdminShell } from "@/components/admin/AdminShell";
import { AdminReconciliationClient } from "@/components/admin/AdminReconciliationClient";

export default function AdminReconciliationPage() {
  return (
    <AdminShell
      title="Reconciliation"
      subtitle="Compare account balances against ledger-derived totals."
    >
      <AdminReconciliationClient />
    </AdminShell>
  );
}
