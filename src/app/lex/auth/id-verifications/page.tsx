import { AdminIdVerificationsClient } from "@/components/admin/AdminIdVerificationsClient";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminIdVerificationsPage() {
  return (
    <AdminShell
      title="ID verifications"
      subtitle="Review member ID photos, then approve, reject, or decline submissions."
    >
      <AdminIdVerificationsClient />
    </AdminShell>
  );
}
