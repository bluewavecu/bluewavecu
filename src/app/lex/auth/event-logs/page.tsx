import { AdminShell } from "@/components/admin/AdminShell";
import { AdminEventLogsClient } from "@/components/admin/AdminEventLogsClient";

export default function AdminEventLogsPage() {
  return (
    <AdminShell title="Event Logs" subtitle="Append-only operational and security event history.">
      <AdminEventLogsClient />
    </AdminShell>
  );
}
