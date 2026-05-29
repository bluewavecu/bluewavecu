import { BadgeCheck, Landmark, ShieldCheck } from "lucide-react";
import { accounts as fallbackAccounts, formatCurrency, loanOffer } from "@/data/mockBanking";
import type { AccountType, DashboardAccount, DashboardLoan } from "@/types/banking";

type AccountOverviewProps = {
  accounts?: DashboardAccount[];
  loans?: DashboardLoan[];
};

type DisplayAccount = {
  id: string;
  type: string;
  name: string;
  number: string;
  available: number;
  status: string;
  accent: string;
};

type DisplayLoan = {
  title: string;
  amount: string;
  rateLabel: string;
  description: string;
};

const accountMeta: Record<AccountType, { type: string; accent: string }> = {
  CHECKING: {
    type: "Checking",
    accent: "from-ocean-blue to-light-blue",
  },
  SAVINGS: {
    type: "Savings",
    accent: "from-royal-blue to-ocean-blue",
  },
  CREDIT: {
    type: "Credit Card",
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
    type: meta.type,
    name: account.displayName,
    number: account.maskedAccountNumber,
    available: account.availableBalance,
    status: getStatusLabel(account.status),
    accent: meta.accent,
  };
}

function mapFallbackAccount(account: (typeof fallbackAccounts)[number]): DisplayAccount {
  return {
    id: account.id,
    type: account.type,
    name: account.name,
    number: account.number,
    available: account.available,
    status: account.status,
    accent: account.accent,
  };
}

function getLoanDisplay(loans?: DashboardLoan[]): DisplayLoan {
  const loan = loans?.[0];

  if (!loan) {
    return loanOffer;
  }

  return {
    title: `${loan.loanType} preview`,
    amount: formatCurrency(loan.principal),
    rateLabel:
      loan.interestRate > 0
        ? `${loan.interestRate.toFixed(2)}% rate placeholder`
        : "Rate placeholder",
    description: `${getStatusLabel(loan.status)} lending record prepared for future eligibility, documents, and servicing workflows.`,
  };
}

export function AccountOverview({ accounts, loans }: AccountOverviewProps) {
  const displayAccounts =
    accounts !== undefined
      ? accounts.map(mapDashboardAccount)
      : fallbackAccounts.map(mapFallbackAccount);
  const displayLoan = getLoanDisplay(loans);

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
        {displayAccounts.map((account) => (
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
            <p className="text-sm font-semibold">{displayLoan.title}</p>
            <p className="mt-2 text-2xl font-semibold">{displayLoan.amount}</p>
            <p className="mt-1 text-xs text-white/[0.58]">{displayLoan.rateLabel}</p>
            <p className="mt-3 text-sm leading-6 text-white/[0.68]">{displayLoan.description}</p>
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
