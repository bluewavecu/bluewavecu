import { AccountDetailClient } from "@/components/accounts/AccountDetailClient";
import { AppShell } from "@/components/layout/AppShell";

export default function AccountDetailPage() {
  return (
    <AppShell title="Account details" subtitle="Account number, activity, and member actions.">
      <AccountDetailClient />
    </AppShell>
  );
}
