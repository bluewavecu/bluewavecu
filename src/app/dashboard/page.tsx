import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { AppShell } from "@/components/layout/AppShell";

export default function DashboardPage() {
  return (
    <AppShell
      title="Dashboard"
      subtitle="Review authenticated balances, activity, and account service signals from one banking dashboard."
    >
      <DashboardClient />
    </AppShell>
  );
}
