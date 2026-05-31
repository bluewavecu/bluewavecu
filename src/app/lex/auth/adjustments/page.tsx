import { AdminShell } from "@/components/admin/AdminShell";
import { AdminAdjustmentsClient } from "@/components/admin/AdminAdjustmentsClient";

export default function AdminAdjustmentsPage() {
  return (
    <AdminShell title="Adjustments" subtitle="Credit or debit member accounts with a scheduled effective date.">
      <AdminAdjustmentsClient />
    </AdminShell>
  );
}
