import { BadgeCheck, Landmark, ShieldCheck } from "lucide-react";
import { accounts, formatCurrency, loanOffer } from "@/data/mockBanking";

export function AccountOverview() {
  return (
    <section
      aria-labelledby="account-overview"
      className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 id="account-overview" className="text-lg font-semibold text-primary-navy dark:text-white">
            Account overview
          </h2>
          <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
            Account snapshots and product readiness.
          </p>
        </div>
        <ShieldCheck size={22} className="text-ocean-blue" aria-hidden="true" />
      </div>

      <div className="mt-5 space-y-4">
        {accounts.map((account) => (
          <div key={account.id} className="rounded-lg bg-[#f7fbff] p-4 dark:bg-white/[0.05]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-primary-navy dark:text-white">
                  {account.type}
                </p>
                <p className="mt-1 text-xs text-bluewave-gray dark:text-white/[0.54]">
                  {account.name} | {account.number}
                </p>
              </div>
              <p className="text-sm font-semibold text-primary-navy dark:text-white">
                {formatCurrency(account.available)}
              </p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-primary-navy/[0.08] dark:bg-white/[0.10]">
              <div className={`h-full w-2/3 rounded-full bg-gradient-to-r ${account.accent}`} />
            </div>
            <p className="mt-2 text-xs font-medium text-bluewave-gray dark:text-white/[0.54]">
              {account.status}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-lg bg-primary-navy p-5 text-white">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-light-blue/[0.16] text-light-blue">
            <Landmark size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold">{loanOffer.title}</p>
            <p className="mt-2 text-2xl font-semibold">{loanOffer.amount}</p>
            <p className="mt-1 text-xs text-white/[0.58]">{loanOffer.rateLabel}</p>
            <p className="mt-3 text-sm leading-6 text-white/[0.68]">{loanOffer.description}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-light-blue">
              <BadgeCheck size={16} aria-hidden="true" />
              Preview only
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
