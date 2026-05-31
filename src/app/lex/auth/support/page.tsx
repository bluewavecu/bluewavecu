import { AdminSupportClient } from "@/components/admin/AdminSupportClient";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminSupportPage() {
  return (
    <AdminShell
      title="Support"
      subtitle="Manage support tickets and update ticket status."
    >
      <AdminSupportClient />
    </AdminShell>
  );
}
