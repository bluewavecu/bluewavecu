"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Repeat2 } from "lucide-react";
import {
  TransactionDetailDrawer,
  type TransactionDrawerItem,
} from "@/components/transactions/TransactionDetailDrawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  getTransactionAmountClass,
  getTransactionIconKind,
  getTransactionStatusBadgeClass,
  getTransactionStatusLabel,
  getTransactionTitle,
} from "@/lib/transactionDisplay";
import { cn } from "@/lib/utils";
import {
  RECENT_ACCOUNT_ACTIVITY_DESCRIPTION,
  RECENT_ACCOUNT_ACTIVITY_EMPTY_MESSAGE,
  RECENT_ACCOUNT_ACTIVITY_EMPTY_TITLE,
  RECENT_ACCOUNT_ACTIVITY_TITLE,
} from "@/lib/activityLabels";
import type { DashboardTransaction } from "@/types/banking";

const transactionIcons = {
  credit: ArrowDownLeft,
  debit: ArrowUpRight,
  transfer: Repeat2,
};

type RecentTransactionsProps = {
  transactions?: DashboardTransaction[];
  description?: string;
  showHeader?: boolean;
  viewAllHref?: string;
};

function formatTransactionDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function toDrawerItem(transaction: DashboardTransaction): TransactionDrawerItem {
  return {
    id: transaction.id,
    amount: transaction.amount,
    description: transaction.description,
    merchant: transaction.merchant,
    reference: transaction.reference,
    status: transaction.status,
    type: transaction.type,
    maskedAccountNumber: transaction.maskedAccountNumber,
    createdAt: transaction.createdAt,
  };
}

export function RecentTransactions({
  transactions,
  description = RECENT_ACCOUNT_ACTIVITY_DESCRIPTION,
  showHeader = true,
  viewAllHref,
}: RecentTransactionsProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDrawerItem | null>(null);

  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState
        title={RECENT_ACCOUNT_ACTIVITY_EMPTY_TITLE}
        message={RECENT_ACCOUNT_ACTIVITY_EMPTY_MESSAGE}
      />
    );
  }

  return (
    <>
      <section
        aria-labelledby={showHeader ? "recent-transactions" : undefined}
        className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
      >
        {showHeader ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2
                id="recent-transactions"
                className="text-lg font-semibold text-primary-navy dark:text-white"
              >
                {RECENT_ACCOUNT_ACTIVITY_TITLE}
              </h2>
              <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                {description}
              </p>
            </div>
            {viewAllHref ? (
              <Link
                href={viewAllHref}
                className="shrink-0 text-sm font-semibold text-royal-blue dark:text-light-blue"
              >
                View all
              </Link>
            ) : null}
          </div>
        ) : null}

        <div className={cn("divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]", showHeader && "mt-5")}>
          {transactions.map((transaction) => {
            const kind = getTransactionIconKind(transaction.type, transaction.amount);
            const Icon = transactionIcons[kind];
            const inflow = transaction.amount > 0;
            const title = getTransactionTitle(transaction);

            return (
              <article
                key={transaction.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedTransaction(toDrawerItem(transaction))}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    setSelectedTransaction(toDrawerItem(transaction));
                  }
                }}
                className="flex cursor-pointer items-center gap-4 py-4 transition hover:bg-ocean-blue/[0.04] first:pt-0 last:pb-0"
              >
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
                    inflow
                      ? "bg-emerald-500/[0.12] text-emerald-700 dark:text-emerald-300"
                      : "bg-red-500/[0.10] text-red-700 dark:text-red-300",
                  )}
                >
                  <Icon size={19} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="truncate text-sm font-semibold text-primary-navy dark:text-white">
                      {title}
                    </h3>
                    <p className={cn("text-sm font-semibold", getTransactionAmountClass(transaction.amount))}>
                      {inflow ? "+" : "-"}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </p>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-bluewave-gray dark:text-white/[0.58]">
                    <span>
                      {formatTransactionDate(transaction.createdAt)} · {transaction.description}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        getTransactionStatusBadgeClass(transaction.status, transaction.amount),
                      )}
                    >
                      {getTransactionStatusLabel(transaction.status, transaction.type)}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <TransactionDetailDrawer
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </>
  );
}
