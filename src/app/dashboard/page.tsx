import { AlertTriangle } from "lucide-react";
import { AccountOverview } from "@/components/dashboard/AccountOverview";
import { BalanceCards } from "@/components/dashboard/BalanceCards";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { AppShell } from "@/components/layout/AppShell";
import { userProfile } from "@/data/mockBanking";

export default function DashboardPage() {
  return (
    <AppShell
      title={`Welcome back, ${userProfile.firstName}`}
      subtitle="Review balances, activity, and important account placeholders from one banking dashboard."
    >
      <div className="space-y-5">
        <BalanceCards />

        <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <QuickActions />
          <RecentTransactions />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <AccountOverview />
          <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
            <div className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue dark:text-light-blue">
                <AlertTriangle size={21} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
                  Security notice
                </h2>
                <p className="mt-3 text-sm leading-6 text-bluewave-gray dark:text-white/[0.62]">
                  This dashboard is a static UI foundation. Do not enter real banking
                  credentials, card numbers, or sensitive member information until real
                  authentication and backend security are implemented.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
