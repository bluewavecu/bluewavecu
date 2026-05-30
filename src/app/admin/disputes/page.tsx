import { AdminShell } from "@/components/admin/AdminShell";
import { AdminDisputesClient } from "@/components/admin/AdminDisputesClient";

export default function AdminDisputesPage() {
  return (
    <AdminShell title="Disputes" subtitle="Review member transaction disputes without automatic reversals.">
      <AdminDisputesClient />
    </AdminShell>
  );
}
