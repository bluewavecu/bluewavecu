import { CreditCard, TrendingUp, WalletCards } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { AccountNumberDisplay } from "@/components/shared/AccountNumberDisplay";
import { formatCurrency } from "@/lib/formatCurrency";
import { getShareAccountLabel } from "@/lib/institution";
import type { AccountType, DashboardAccount } from "@/types/banking";

type BalanceCardsProps = {
  accounts?: DashboardAccount[];
};

type DisplayAccount = {
  id: string;
  type: string;
  name: string;
  number: string;
  balance: number;
  available: number;
  status: string;
  trend: string;
  accent: string;
  isCredit: boolean;
};

const accountMeta: Record<AccountType, { accent: string; trend: string }> = {
  CHECKING: {
    accent: "from-ocean-blue to-light-blue",
    trend: "Active",
  },
  SAVINGS: {
    accent: "from-royal-blue to-ocean-blue",
    trend: "Growing",
  },
  BUSINESS: {
    accent: "from-primary-navy to-royal-blue",
    trend: "Business",
  },
  MONEY_MARKET: {
    accent: "from-royal-blue to-light-blue",
    trend: "Earning",
  },
  CERTIFICATE: {
    accent: "from-ocean-blue to-primary-navy",
    trend: "Fixed term",
  },
  CREDIT: {
    accent: "from-primary-navy to-royal-blue",
    trend: "In use",
  },
};

function getStatusLabel(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function mapDashboardAccount(account: DashboardAccount): DisplayAccount {
  const meta = accountMeta[account.accountType];

  return {
    id: account.id,
    type: getShareAccountLabel(account.accountType),
    name: account.displayName,
    number: account.accountNumber,
    balance: account.balance,
    available: account.availableBalance,
    status: getStatusLabel(account.status),
    trend: meta.trend,
    accent: meta.accent,
    isCredit: account.accountType === "CREDIT",
  };
}

export function BalanceCards({ accounts }: BalanceCardsProps) {
  if (!accounts || accounts.length === 0) {
    return (
      <EmptyState
        title="No accounts to display"
        message="Your linked accounts will appear here once membership accounts are active."
      />
    );
  }

  const displayAccounts = accounts.map(mapDashboardAccount);

  return (
    <section aria-labelledby="balance-cards" className="grid gap-4 lg:grid-cols-3">
      <h2 id="balance-cards" className="sr-only">
        Balance Cards
      </h2>
      {displayAccounts.map((account) => {
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
                  {account.isCredit ? (
                    <CreditCard size={21} aria-hidden="true" />
                  ) : (
                    <WalletCards size={21} aria-hidden="true" />
                  )}
                </span>
              </div>

              <div className="mt-7">
                <p className="text-xs font-semibold uppercase text-bluewave-gray dark:text-white/[0.48]">
                  {account.isCredit ? "Current balance" : "Available balance"}
                </p>
                <p className="mt-2 text-3xl font-semibold text-primary-navy dark:text-white">
                  {formatCurrency(account.isCredit ? account.balance : account.available)}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-primary-navy/[0.08] pt-4 text-sm dark:border-white/[0.08]">
                <AccountNumberDisplay accountNumber={account.number} />
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
