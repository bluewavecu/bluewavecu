import { AdminSessionsClient } from "@/components/admin/AdminSessionsClient";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminSessionsPage() {
  return (
    <AdminShell
      title="Sessions & Security"
      subtitle="Active member sessions and recent sign-in activity."
    >
      <AdminSessionsClient />
    </AdminShell>
  );
}
