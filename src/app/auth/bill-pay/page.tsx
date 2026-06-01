import { AppShell } from "@/components/layout/AppShell";
import { BillPayClient } from "@/components/bill-pay/BillPayClient";

export default function BillPayPage() {
  return (
    <AppShell title="Bill Pay" subtitle="Pay bills and manage payees.">
      <BillPayClient />
    </AppShell>
  );
}
