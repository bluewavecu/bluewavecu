import { AdminShell } from "@/components/admin/AdminShell";
import { AdminJobsClient } from "@/components/admin/AdminJobsClient";

export default function AdminJobsPage() {
  return (
    <AdminShell
      title="Job Queue"
      subtitle="Review queued jobs and manually trigger the internal worker runner."
    >
      <AdminJobsClient />
    </AdminShell>
  );
}
