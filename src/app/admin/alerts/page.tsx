import { AdminOperationalAlertsClient } from "@/components/admin/AdminOperationalAlertsClient";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminAlertsPage() {
  return (
    <AdminShell
      title="Operational Alerts"
      subtitle="Pending reviews, open tickets, disputes, and security signals."
    >
      <AdminOperationalAlertsClient />
    </AdminShell>
  );
}
