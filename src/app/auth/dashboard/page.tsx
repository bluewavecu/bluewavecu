import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { AppShell } from "@/components/layout/AppShell";

export default function DashboardPage() {
  return (
    <AppShell
      title="Overview"
      subtitle="Your complete member banking hub — balances, activity, alerts, and quick actions."
    >
      <DashboardClient />
    </AppShell>
  );
}
