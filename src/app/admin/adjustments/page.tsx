import { AdminShell } from "@/components/admin/AdminShell";
import { AdminAdjustmentsClient } from "@/components/admin/AdminAdjustmentsClient";

export default function AdminAdjustmentsPage() {
  return (
    <AdminShell title="Adjustments" subtitle="Controlled balance adjustments with ledger-backed posting.">
      <AdminAdjustmentsClient />
    </AdminShell>
  );
}
