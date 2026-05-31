import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { AppShell } from "@/components/layout/AppShell";

export default function DashboardPage() {
  return (
    <AppShell compactMobileHeader title="Overview" subtitle="Your complete member banking hub — balances, activity, alerts, and quick actions.">
      <DashboardClient />
    </AppShell>
  );
}
