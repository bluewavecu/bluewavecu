"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeftRight, ReceiptText, Scale, WalletCards } from "lucide-react";
import { AccountActivityTimeline } from "@/components/accounts/AccountActivityTimeline";
import { StatementExportCard } from "@/components/accounts/StatementExportCard";
import { DetailDrawer } from "@/components/ui/DetailDrawer";
import { Amount } from "@/components/ui/Amount";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/lib/formatCurrency";
import { useAccounts } from "@/hooks/useAccounts";
import { cn } from "@/lib/utils";
import { AccountNumberDisplay } from "@/components/shared/AccountNumberDisplay";
import { getShareAccountLabel } from "@/lib/institution";
import type { PageAccount } from "@/types/banking";

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
  const [selectedAccount, setSelectedAccount] = useState<PageAccount | null>(null);

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
          <article
            key={account.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedAccount(account)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                setSelectedAccount(account);
              }
            }}
            className="cursor-pointer rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] transition hover:border-ocean-blue/[0.40] dark:border-white/[0.08] dark:bg-white/[0.06]"
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
            <p className="mt-5 text-xs text-bluewave-gray dark:text-white/[0.48]">
              Tap for details, shortcuts, and activity.
            </p>
          </article>
        ))}
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <AccountActivityTimeline limit={12} />
        <StatementExportCard />
      </section>

      <DetailDrawer
        open={Boolean(selectedAccount)}
        title={selectedAccount?.displayName ?? "Account"}
        subtitle={selectedAccount?.accountNumber ? undefined : "Account details"}
        onClose={() => setSelectedAccount(null)}
        footer={
          selectedAccount ? (
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/transfers?from=${selectedAccount.id}`}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-ocean-blue px-4 text-sm font-semibold text-primary-navy"
              >
                <ArrowLeftRight size={16} aria-hidden="true" />
                Transfer
              </Link>
              <Link
                href="/auth/statements"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-primary-navy/[0.10] px-4 text-sm font-semibold dark:border-white/[0.10]"
              >
                Statement
              </Link>
              <Link
                href="/auth/disputes"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-primary-navy/[0.10] px-4 text-sm font-semibold dark:border-white/[0.10]"
              >
                <Scale size={16} aria-hidden="true" />
                Dispute
              </Link>
            </div>
          ) : null
        }
      >
        {selectedAccount ? (
          <div className="space-y-4 text-sm">
            <p className="text-bluewave-gray dark:text-white/[0.58]">
              Only approved and posted transactions affect balances.
            </p>
            <div className="grid gap-3 rounded-lg bg-[#f7fbff] p-4 dark:bg-white/[0.05]">
              <div className="flex justify-between">
                <span>Available</span>
                <Amount value={selectedAccount.availableBalance} showSign={false} />
              </div>
              <div className="flex justify-between">
                <span>Current</span>
                <Amount value={selectedAccount.balance} showSign={false} />
              </div>
              <div className="flex justify-between">
                <span>Routing</span>
                <span className="font-semibold">{selectedAccount.routingNumber}</span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span>Account number</span>
                <AccountNumberDisplay accountNumber={selectedAccount.accountNumber} />
              </div>
            </div>
            <AccountActivityTimeline accountId={selectedAccount.id} limit={6} />
          </div>
        ) : null}
      </DetailDrawer>
    </section>
  );
}
