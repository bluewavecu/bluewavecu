import { AdminAccountsClient } from "@/components/admin/AdminAccountsClient";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminAccountsPage() {
  return (
    <AdminShell
      title="Accounts"
      subtitle="Review member accounts with masked numbers and linked user summaries."
    >
      <AdminAccountsClient />
    </AdminShell>
  );
}
