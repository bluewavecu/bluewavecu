import { AdminShell } from "@/components/admin/AdminShell";
import { AdminRiskClient } from "@/components/admin/AdminRiskClient";

export default function AdminRiskPage() {
  return (
    <AdminShell
      title="Risk Monitoring"
      subtitle="Review recent risk events, severity scores, and member activity signals."
    >
      <AdminRiskClient />
    </AdminShell>
  );
}
