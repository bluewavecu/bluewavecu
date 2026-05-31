"use client";

import Link from "next/link";
import { ArrowLeftRight, ChevronRight, ReceiptText, WalletCards } from "lucide-react";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { StatementExportCard } from "@/components/accounts/StatementExportCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/lib/formatCurrency";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { cn } from "@/lib/utils";
import { AccountNumberDisplay } from "@/components/shared/AccountNumberDisplay";
import { getShareAccountLabel } from "@/lib/institution";

const quickActions = [
  { label: "Transfer funds", href: "/auth/transfers", icon: ArrowLeftRight },
  { label: "View activity", href: "/auth/transactions", icon: ReceiptText },
];

function getStatusLabel(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function AccountsClient() {
  const { data, error, isLoading, refetch } = useAccounts();
  const {
    data: transactionsData,
    error: transactionsError,
    isLoading: transactionsLoading,
  } = useTransactions({ limit: 12 });

  if (isLoading) {
    return <LoadingState title="Loading accounts" message="Retrieving your account information." />;
  }

  if (error) {
    return <ApiErrorState message={error} onRetry={refetch} />;
  }

  if (!data || data.accounts.length === 0) {
    return (
      <EmptyState
        title="No accounts found"
        message="No accounts are linked to your membership yet. Contact member services to open an account."
      />
    );
  }

  const totalAvailable = data.accounts.reduce(
    (sum, account) => sum + account.availableBalance,
    0,
  );

  const recentTransactions = transactionsData?.transactions.map((transaction) => ({
    id: transaction.id,
    accountId: transaction.accountId,
    accountType: transaction.accountType,
    maskedAccountNumber: transaction.maskedAccountNumber,
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
    merchant: transaction.merchant,
    reference: transaction.reference,
    status: transaction.status,
    createdAt: transaction.createdAt,
  }));

  return (
    <section className="grid gap-5">
      <div className="grid gap-5 lg:grid-cols-3">
        <article className="rounded-lg border border-primary-navy/[0.08] bg-primary-navy p-5 text-white shadow-[0_18px_60px_rgba(10,42,94,0.12)] lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/[0.58]">
            Total available
          </p>
          <p className="mt-3 text-4xl font-semibold">{formatCurrency(totalAvailable)}</p>
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
          <Link
            key={account.id}
            href={`/auth/accounts/${account.id}`}
            className="group block rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] transition hover:border-ocean-blue/[0.40] dark:border-white/[0.08] dark:bg-white/[0.06]"
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
              {getShareAccountLabel(account.accountType)}
            </p>
            <div className="mt-2">
              <AccountNumberDisplay accountNumber={account.accountNumber} />
            </div>
            <div className="mt-6 rounded-lg bg-[#f7fbff] p-4 dark:bg-white/[0.05]">
              <p className="text-xs font-semibold uppercase text-bluewave-gray dark:text-white/[0.48]">
                Available balance
              </p>
              <p className="mt-2 text-3xl font-semibold text-primary-navy dark:text-white">
                {formatCurrency(account.availableBalance)}
              </p>
              <p className="mt-1 text-xs text-bluewave-gray dark:text-white/[0.48]">
                Current balance: {formatCurrency(account.balance)}
              </p>
              <p className="mt-2 text-xs text-bluewave-gray dark:text-white/[0.48]">
                Routing {account.routingNumber}
              </p>
            </div>
            <p className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-royal-blue dark:text-light-blue">
              View account details
              <ChevronRight size={14} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
            </p>
          </Link>
        ))}
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        {transactionsLoading ? (
          <LoadingState title="Loading transactions" message="Retrieving recent activity." />
        ) : transactionsError ? (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-700 dark:text-red-300">
            {transactionsError}
          </p>
        ) : recentTransactions && recentTransactions.length > 0 ? (
          <RecentTransactions transactions={recentTransactions} />
        ) : (
          <EmptyState
            title="No recent transactions"
            message="Account activity will appear here as transactions post to your accounts."
          />
        )}
        <StatementExportCard />
      </section>
    </section>
  );
}
