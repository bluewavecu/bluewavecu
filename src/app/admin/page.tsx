import { AdminOverviewClient } from "@/components/admin/AdminOverviewClient";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminPage() {
  return (
    <AdminShell
      title="Admin Overview"
      subtitle="Monitor users, accounts, transactions, support volume, and pending transfer review."
    >
      <AdminOverviewClient />
    </AdminShell>
  );
}
