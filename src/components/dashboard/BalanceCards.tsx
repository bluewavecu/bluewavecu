import { CreditCard, TrendingUp, WalletCards } from "lucide-react";
import { accounts, formatCurrency } from "@/data/mockBanking";

export function BalanceCards() {
  return (
    <section aria-labelledby="balance-cards" className="grid gap-4 lg:grid-cols-3">
      <h2 id="balance-cards" className="sr-only">
        Balance Cards
      </h2>
      {accounts.map((account) => {
        const isCredit = account.id === "credit-card";

        return (
          <article
            key={account.id}
            className="overflow-hidden rounded-lg border border-primary-navy/[0.08] bg-white shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
          >
            <div className={`h-2 bg-gradient-to-r ${account.accent}`} />
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-bluewave-gray dark:text-white/[0.58]">
                    {account.type}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-primary-navy dark:text-white">
                    {account.name}
                  </h3>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue dark:text-light-blue">
                  {isCredit ? (
                    <CreditCard size={21} aria-hidden="true" />
                  ) : (
                    <WalletCards size={21} aria-hidden="true" />
                  )}
                </span>
              </div>

              <div className="mt-7">
                <p className="text-xs font-semibold uppercase text-bluewave-gray dark:text-white/[0.48]">
                  {isCredit ? "Current balance" : "Available balance"}
                </p>
                <p className="mt-2 text-3xl font-semibold text-primary-navy dark:text-white">
                  {formatCurrency(isCredit ? account.balance : account.available)}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-primary-navy/[0.08] pt-4 text-sm dark:border-white/[0.08]">
                <span className="font-medium text-bluewave-gray dark:text-white/[0.58]">
                  {account.number}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-ocean-blue/[0.10] px-3 py-1 font-semibold text-royal-blue dark:text-light-blue">
                  <TrendingUp size={14} aria-hidden="true" />
                  {account.trend}
                </span>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
