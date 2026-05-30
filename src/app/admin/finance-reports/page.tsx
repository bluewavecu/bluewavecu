import { AdminShell } from "@/components/admin/AdminShell";
import { AdminFinanceReportsClient } from "@/components/admin/AdminFinanceReportsClient";

export default function AdminFinanceReportsPage() {
  return (
    <AdminShell
      title="Finance Reports"
      subtitle="Aggregate balances, ledger activity, review queues, support, and risk metrics."
    >
      <AdminFinanceReportsClient />
    </AdminShell>
  );
}
