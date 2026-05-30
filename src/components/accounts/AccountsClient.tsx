"use client";

import Link from "next/link";
import { ArrowLeftRight, BadgeCheck, ReceiptText, WalletCards } from "lucide-react";
import { AccountActivityTimeline } from "@/components/accounts/AccountActivityTimeline";
import { StatementExportCard } from "@/components/accounts/StatementExportCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/data/mockBanking";
import { useAccounts } from "@/hooks/useAccounts";
import { cn } from "@/lib/utils";
import type { AccountType } from "@/types/banking";

const quickActions = [
  { label: "Transfer funds", href: "/transfers", icon: ArrowLeftRight },
  { label: "View activity", href: "/transactions", icon: ReceiptText },
];

function getStatusLabel(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getAccountTypeLabel(accountType: AccountType) {
  if (accountType === "CREDIT") {
    return "Credit";
  }

  if (accountType === "SAVINGS") {
    return "Savings";
  }

  return "Checking";
}

export function AccountsClient() {
  const { data, error, isLoading, refetch } = useAccounts();

  if (isLoading) {
    return <LoadingState title="Loading accounts" message="Retrieving authenticated account data." />;
  }

  if (error) {
    return <ApiErrorState message={error} onRetry={refetch} />;
  }

  if (!data || data.accounts.length === 0) {
    return (
      <EmptyState
        title="No accounts found"
        message="Seed demo banking data or add account creation flows before reviewing accounts."
      />
    );
  }

  const totalAvailable = data.accounts.reduce(
    (sum, account) => sum + account.availableBalance,
    0,
  );

  return (
    <section className="grid gap-5">
      <div className="grid gap-5 lg:grid-cols-3">
        <article className="rounded-lg border border-primary-navy/[0.08] bg-primary-navy p-5 text-white shadow-[0_18px_60px_rgba(10,42,94,0.12)] lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/[0.58]">
            Total available
          </p>
          <p className="mt-3 text-4xl font-semibold">{formatCurrency(totalAvailable)}</p>
          <p className="mt-3 text-sm leading-6 text-white/[0.68]">
            Across {data.accounts.length} authenticated Bluewave accounts. Only approved and
            posted transactions affect balances.
          </p>
        </article>

        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center justify-between rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] transition hover:border-ocean-blue/[0.40] dark:border-white/[0.08] dark:bg-white/[0.06]"
            >
              <div>
                <p className="text-sm font-semibold text-primary-navy dark:text-white">
                  {action.label}
                </p>
                <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                  Quick action
                </p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue dark:text-light-blue">
                <Icon size={20} aria-hidden="true" />
              </span>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {data.accounts.map((account) => (
          <article
            key={account.id}
            className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue dark:text-light-blue">
                <WalletCards size={22} aria-hidden="true" />
              </span>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  account.status === "ACTIVE"
                    ? "bg-ocean-blue/[0.10] text-royal-blue dark:text-light-blue"
                    : "bg-primary-navy/[0.06] text-primary-navy dark:bg-white/[0.08] dark:text-white",
                )}
              >
                {getStatusLabel(account.status)}
              </span>
            </div>
            <h2 className="mt-6 text-xl font-semibold text-primary-navy dark:text-white">
              {account.displayName}
            </h2>
            <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
              {getAccountTypeLabel(account.accountType)} | {account.maskedAccountNumber}
            </p>
            <div className="mt-6 rounded-lg bg-[#f7fbff] p-4 dark:bg-white/[0.05]">
              <p className="text-xs font-semibold uppercase text-bluewave-gray dark:text-white/[0.48]">
                Available balance
              </p>
              <p className="mt-2 text-3xl font-semibold text-primary-navy dark:text-white">
                {formatCurrency(account.availableBalance)}
              </p>
              <p className="mt-2 text-xs text-bluewave-gray dark:text-white/[0.48]">
                Routing {account.routingNumber}
              </p>
            </div>
            <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-royal-blue dark:text-light-blue">
              <BadgeCheck size={16} aria-hidden="true" />
              Live account data
            </p>
          </article>
        ))}
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <AccountActivityTimeline limit={12} />
        <StatementExportCard />
      </section>
    </section>
  );
}
