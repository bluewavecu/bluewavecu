import { BadgeCheck, WalletCards } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { accounts, formatCurrency } from "@/data/mockBanking";

export default function AccountsPage() {
  return (
    <AppShell
      title="Accounts"
      subtitle="View checking, savings, and card account surfaces from the mocked banking dataset."
    >
      <section className="grid gap-5 lg:grid-cols-3">
        {accounts.map((account) => (
          <article
            key={account.id}
            className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue dark:text-light-blue">
                <WalletCards size={22} aria-hidden="true" />
              </span>
              <span className="rounded-full bg-primary-navy/[0.06] px-3 py-1 text-xs font-semibold text-primary-navy dark:bg-white/[0.08] dark:text-white">
                {account.status}
              </span>
            </div>
            <h2 className="mt-6 text-xl font-semibold text-primary-navy dark:text-white">
              {account.name}
            </h2>
            <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
              {account.type} | {account.number}
            </p>
            <div className="mt-6 rounded-lg bg-[#f7fbff] p-4 dark:bg-white/[0.05]">
              <p className="text-xs font-semibold uppercase text-bluewave-gray dark:text-white/[0.48]">
                Available
              </p>
              <p className="mt-2 text-3xl font-semibold text-primary-navy dark:text-white">
                {formatCurrency(account.available)}
              </p>
            </div>
            <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-royal-blue dark:text-light-blue">
              <BadgeCheck size={16} aria-hidden="true" />
              Mock account data
            </p>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
