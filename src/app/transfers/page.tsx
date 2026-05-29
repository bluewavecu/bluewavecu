import { ArrowLeftRight, CalendarDays, Send } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { accounts } from "@/data/mockBanking";

export default function TransfersPage() {
  return (
    <AppShell
      title="Transfers"
      subtitle="Prepare the transfer UI foundation before connecting real account movement."
    >
      <section className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue dark:text-light-blue">
              <Send size={21} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
                New transfer
              </h2>
              <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">
                Non-functional form for future backend wiring.
              </p>
            </div>
          </div>

          <form className="mt-6 space-y-4">
            {["From account", "To account"].map((label) => (
              <label key={label} className="block">
                <span className="text-sm font-semibold text-primary-navy dark:text-white">
                  {label}
                </span>
                <select className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm text-primary-navy outline-none focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white">
                  {accounts.map((account) => (
                    <option key={account.id}>{account.name}</option>
                  ))}
                </select>
              </label>
            ))}
            <label className="block">
              <span className="text-sm font-semibold text-primary-navy dark:text-white">
                Amount
              </span>
              <input
                type="text"
                placeholder="$0.00"
                className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm text-primary-navy outline-none placeholder:text-bluewave-gray focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
              />
            </label>
            <button
              type="button"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy transition hover:bg-light-blue"
            >
              Continue Transfer
              <ArrowLeftRight size={17} aria-hidden="true" />
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-primary-navy/[0.08] bg-primary-navy p-6 text-white shadow-[0_18px_60px_rgba(10,42,94,0.12)]">
          <CalendarDays size={24} className="text-light-blue" aria-hidden="true" />
          <h2 className="mt-5 text-2xl font-semibold">Scheduled payments preview</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/[0.68]">
            This area is reserved for scheduled transfers, recurring payments, and
            approval states once the API layer exists.
          </p>
          <div className="mt-7 grid gap-3">
            {["Rent transfer", "Savings auto-deposit", "Card payment"].map((item) => (
              <div key={item} className="rounded-lg border border-white/[0.12] bg-white/[0.08] p-4">
                <p className="font-semibold">{item}</p>
                <p className="mt-1 text-sm text-white/[0.58]">Schedule placeholder</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
