import { CreditCard, LockKeyhole, Snowflake, Wifi } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { accounts, formatCurrency } from "@/data/mockBanking";

const cardAccount = accounts.find((account) => account.id === "credit-card") ?? accounts[0];

export default function CardsPage() {
  return (
    <AppShell
      title="Cards"
      subtitle="Manage card controls, spending previews, and payment placeholders from one screen."
    >
      <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-lg bg-[linear-gradient(135deg,#0A2A5E,#0D47A1_62%,#00A8E8)] p-6 text-white shadow-[0_22px_80px_rgba(10,42,94,0.20)]">
          <div className="flex items-start justify-between">
            <CreditCard size={28} className="text-light-blue" aria-hidden="true" />
            <span className="rounded-full bg-white/[0.12] px-3 py-1 text-xs font-semibold">
              Preview card
            </span>
          </div>
          <p className="mt-14 text-sm uppercase tracking-[0.18em] text-white/[0.54]">
            Bluewave Rewards
          </p>
          <p className="mt-4 text-2xl font-semibold">{cardAccount.number}</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-white/[0.50]">Current balance</p>
              <p className="mt-2 text-xl font-semibold">{formatCurrency(cardAccount.balance)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-white/[0.50]">Available credit</p>
              <p className="mt-2 text-xl font-semibold">{formatCurrency(cardAccount.available)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
          <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
            Card controls
          </h2>
          <div className="mt-5 grid gap-3">
            {[
              { label: "Lock card", icon: LockKeyhole },
              { label: "Freeze online purchases", icon: Snowflake },
              { label: "Contactless controls", icon: Wifi },
            ].map((control) => {
              const Icon = control.icon;

              return (
                <button
                  key={control.label}
                  type="button"
                  className="flex items-center justify-between rounded-lg border border-primary-navy/[0.08] bg-[#f7fbff] p-4 text-left transition hover:border-ocean-blue/[0.40] dark:border-white/[0.08] dark:bg-white/[0.05]"
                >
                  <span className="flex items-center gap-3 text-sm font-semibold text-primary-navy dark:text-white">
                    <Icon size={18} className="text-royal-blue dark:text-light-blue" aria-hidden="true" />
                    {control.label}
                  </span>
                  <span className="h-6 w-11 rounded-full bg-ocean-blue/[0.18]" />
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
