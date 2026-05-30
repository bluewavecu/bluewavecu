import { AdminAuditLogsClient } from "@/components/admin/AdminAuditLogsClient";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminAuditLogsPage() {
  return (
    <AdminShell
      title="Audit Logs"
      subtitle="Review admin actions recorded for user, transaction, and support updates."
    >
      <AdminAuditLogsClient />
    </AdminShell>
  );
}
