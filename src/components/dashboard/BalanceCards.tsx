import Link from "next/link";
import { ChevronRight, CreditCard, WalletCards } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { AccountNumberDisplay } from "@/components/shared/AccountNumberDisplay";
import { formatCurrency } from "@/lib/formatCurrency";
import { getShareAccountLabel } from "@/lib/institution";
import { sortMemberDisplayAccounts } from "@/lib/sortMemberDisplayAccounts";
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
  accent: string;
  isCredit: boolean;
};

const accountMeta: Record<AccountType, { accent: string }> = {
  CHECKING: {
    accent: "from-ocean-blue to-light-blue",
  },
  SAVINGS: {
    accent: "from-royal-blue to-ocean-blue",
  },
  BUSINESS: {
    accent: "from-primary-navy to-royal-blue",
  },
  MONEY_MARKET: {
    accent: "from-royal-blue to-light-blue",
  },
  CERTIFICATE: {
    accent: "from-ocean-blue to-primary-navy",
  },
  CREDIT: {
    accent: "from-primary-navy to-royal-blue",
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

  const displayAccounts = sortMemberDisplayAccounts(accounts).map(mapDashboardAccount);

  return (
    <section aria-labelledby="balance-cards" className="grid gap-3 sm:grid-cols-2">
      <h2 id="balance-cards" className="sr-only">
        Balance Cards
      </h2>
      {displayAccounts.map((account) => {
        return (
          <Link
            key={account.id}
            href={`/auth/accounts/${account.id}`}
            className="group block overflow-hidden rounded-lg border border-primary-navy/[0.08] bg-white shadow-[0_10px_30px_rgba(10,42,94,0.06)] transition hover:border-ocean-blue/[0.30] dark:border-white/[0.08] dark:bg-white/[0.06]"
          >
            <div className={`h-1 bg-gradient-to-r ${account.accent}`} />
            <div className="flex items-center gap-3 p-3.5 sm:p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ocean-blue/[0.10] text-royal-blue dark:text-light-blue">
                {account.isCredit ? (
                  <CreditCard size={18} aria-hidden="true" />
                ) : (
                  <WalletCards size={18} aria-hidden="true" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold uppercase tracking-wide text-bluewave-gray dark:text-white/[0.52]">
                      {account.type}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-primary-navy dark:text-white">
                      {account.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-bluewave-gray dark:text-white/[0.45]">
                      {account.isCredit ? "Balance" : "Available"}
                    </p>
                    <p className="mt-0.5 text-lg font-semibold text-primary-navy dark:text-white">
                      {formatCurrency(account.isCredit ? account.balance : account.available)}
                    </p>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2 border-t border-primary-navy/[0.06] pt-2 text-xs dark:border-white/[0.06]">
                  <AccountNumberDisplay accountNumber={account.number} />
                  <span className="inline-flex items-center gap-1 font-semibold text-royal-blue opacity-80 transition group-hover:opacity-100 dark:text-light-blue">
                    {account.status}
                    <ChevronRight size={14} aria-hidden="true" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </section>
  );
}
