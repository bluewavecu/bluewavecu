import { ReceiptText } from "lucide-react";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { AppShell } from "@/components/layout/AppShell";
import { recentTransactions } from "@/data/mockBanking";

export default function TransactionsPage() {
  return (
    <AppShell
      title="Transactions"
      subtitle="A transaction history foundation with filters and mocked account activity."
    >
      <section className="grid gap-5 xl:grid-cols-[0.68fr_1.32fr]">
        <aside className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
          <ReceiptText size={24} className="text-ocean-blue" aria-hidden="true" />
          <h2 className="mt-5 text-lg font-semibold text-primary-navy dark:text-white">
            Filters
          </h2>
          <div className="mt-5 grid gap-3">
            {["All accounts", "Last 30 days", "Posted activity"].map((item) => (
              <button
                key={item}
                type="button"
                className="rounded-lg border border-primary-navy/[0.08] bg-[#f7fbff] px-4 py-3 text-left text-sm font-semibold text-primary-navy transition hover:border-ocean-blue/[0.40] dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
              >
                {item}
              </button>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-bluewave-gray dark:text-white/[0.58]">
            Showing {recentTransactions.length} mock records. Export, search, and
            statements are pending backend work.
          </p>
        </aside>
        <RecentTransactions />
      </section>
    </AppShell>
  );
}
