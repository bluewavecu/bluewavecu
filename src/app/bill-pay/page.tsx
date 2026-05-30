import { AppShell } from "@/components/layout/AppShell";
import { BillPayClient } from "@/components/bill-pay/BillPayClient";

export default function BillPayPage() {
  return (
    <AppShell
      title="Bill Pay"
      subtitle="Manage payees and schedule bill payments for admin review before posting."
    >
      <BillPayClient />
    </AppShell>
  );
}
