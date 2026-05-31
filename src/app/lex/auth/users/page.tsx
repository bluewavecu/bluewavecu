import { AdminUsersClient } from "@/components/admin/AdminUsersClient";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminUsersPage() {
  return (
    <AdminShell
      title="Users"
      subtitle="Create members, review accounts, and update user status."
    >
      <AdminUsersClient />
    </AdminShell>
  );
}
