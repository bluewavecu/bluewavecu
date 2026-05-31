import { AdminCardApplicationsClient } from "@/components/admin/AdminCardApplicationsClient";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminCardApplicationsPage() {
  return (
    <AdminShell
      title="Card applications"
      subtitle="Review member Mastercard requests, verify profile details, and approve or decline issuance."
    >
      <AdminCardApplicationsClient />
    </AdminShell>
  );
}
