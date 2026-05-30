import { AdminShell } from "@/components/admin/AdminShell";
import { AdminBillPayClient } from "@/components/admin/AdminBillPayClient";

export default function AdminBillPayPage() {
  return (
    <AdminShell
      title="Bill Pay Review"
      subtitle="Review pending bill payments before ledger posting."
    >
      <AdminBillPayClient />
    </AdminShell>
  );
}
