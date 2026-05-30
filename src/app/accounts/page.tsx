import { AccountsClient } from "@/components/accounts/AccountsClient";
import { AppShell } from "@/components/layout/AppShell";

export default function AccountsPage() {
  return (
    <AppShell
      title="Accounts"
      subtitle="View checking, savings, and credit accounts with live authenticated balances."
    >
      <AccountsClient />
    </AppShell>
  );
}
