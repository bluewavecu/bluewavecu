import { AccountsClient } from "@/components/dashboard/AccountsClient";
import { AppShell } from "@/components/layout/AppShell";

export default function AccountsPage() {
  return (
    <AppShell
      title="Accounts"
      subtitle="View authenticated checking, savings, and credit account surfaces from the dashboard API."
    >
      <AccountsClient />
    </AppShell>
  );
}
