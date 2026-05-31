import { AdminTransactionsClient } from "@/components/admin/AdminTransactionsClient";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminTransferReviewsPage() {
  return (
    <AdminShell
      title="Transfer Reviews"
      subtitle="Pending transfer requests awaiting ledger-controlled approval."
    >
      <AdminTransactionsClient reviewOnly />
    </AdminShell>
  );
}
