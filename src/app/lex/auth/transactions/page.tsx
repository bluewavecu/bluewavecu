import { AdminTransactionsClient } from "@/components/admin/AdminTransactionsClient";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminTransactionsPage() {
  return (
    <AdminShell
      title="Transactions"
      subtitle="Review transaction activity and update pending transfer statuses."
    >
      <AdminTransactionsClient />
    </AdminShell>
  );
}
