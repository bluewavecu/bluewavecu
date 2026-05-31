import { BadgeCheck, Landmark, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import { getShareAccountLabel } from "@/lib/institution";
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

const accountMeta: Record<AccountType, { accent: string }> = {
  CHECKING: {
    accent: "from-ocean-blue to-light-blue",
  },
  SAVINGS: {
    accent: "from-royal-blue to-ocean-blue",
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
    number: account.maskedAccountNumber,
    available: account.availableBalance,
    status: getStatusLabel(account.status),
    accent: meta.accent,
  };
}

export function AccountOverview({ accounts, loans }: AccountOverviewProps) {
  const displayAccounts = accounts?.map(mapDashboardAccount) ?? [];
  const primaryLoan = loans?.[0];

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
            Snapshot of your linked accounts and lending relationship.
          </p>
        </div>
        <ShieldCheck size={22} className="text-ocean-blue" aria-hidden="true" />
      </div>

      <div className="mt-5 space-y-4">
        {displayAccounts.length === 0 ? (
          <p className="rounded-lg border border-dashed border-primary-navy/[0.14] bg-[#f7fbff] p-4 text-sm text-bluewave-gray dark:border-white/[0.14] dark:bg-white/[0.04] dark:text-white/[0.58]">
            No accounts are linked to your membership yet.
          </p>
        ) : (
          displayAccounts.map((account) => (
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
          ))
        )}
      </div>

      <div className="mt-5 rounded-lg bg-primary-navy p-5 text-white">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-light-blue/[0.16] text-light-blue">
            <Landmark size={20} aria-hidden="true" />
          </span>
          <div>
            {primaryLoan ? (
              <>
                <p className="text-sm font-semibold">{primaryLoan.loanType} loan</p>
                <p className="mt-2 text-2xl font-semibold">{formatCurrency(primaryLoan.balance)}</p>
                <p className="mt-1 text-xs text-white/[0.58]">
                  {primaryLoan.interestRate > 0
                    ? `${primaryLoan.interestRate.toFixed(2)}% APR`
                    : "Rate pending disclosure"}
                </p>
                <p className="mt-3 text-sm leading-6 text-white/[0.68]">
                  {getStatusLabel(primaryLoan.status)} — monthly payment{" "}
                  {formatCurrency(primaryLoan.monthlyPayment)}.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold">Lending services</p>
                <p className="mt-3 text-sm leading-6 text-white/[0.68]">
                  Explore personal, auto, and home equity options with competitive member rates.
                  Apply online or speak with a lending specialist.
                </p>
              </>
            )}
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-light-blue">
              <BadgeCheck size={16} aria-hidden="true" />
              NCUA insured institution
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
