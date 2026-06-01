"use client";

import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  RECENT_ACCOUNT_ACTIVITY_EMPTY_TITLE,
  RECENT_ACCOUNT_ACTIVITY_LOADING,
} from "@/lib/activityLabels";
import { useDashboardData } from "@/hooks/useDashboardData";

const transactionFilters = ["All accounts", "Last 30 days", "Posted activity"];

export function TransactionsClient() {
  const { data, error, isLoading, refetch } = useDashboardData();

  if (isLoading) {
    return (
      <LoadingState
        title="Loading transactions"
        message={RECENT_ACCOUNT_ACTIVITY_LOADING}
      />
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  if (!data) {
    return (
      <EmptyState
        title="No transaction data"
        message="Sign in to view your transaction history."
      />
    );
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[0.68fr_1.32fr]">
      <aside className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
        <ReceiptText size={24} className="text-ocean-blue" aria-hidden="true" />
        <h2 className="mt-5 text-lg font-semibold text-primary-navy dark:text-white">
          Filters
        </h2>
        <div className="mt-5 grid gap-3">
          {transactionFilters.map((item) => (
            <Link
              key={item}
              href="/auth/transactions"
              className="rounded-lg border border-primary-navy/[0.08] bg-[#f7fbff] px-4 py-3 text-left text-sm font-semibold text-primary-navy transition hover:border-ocean-blue/[0.40] dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
            >
              {item}
            </Link>
          ))}
        </div>
        <p className="mt-5 text-sm leading-6 text-bluewave-gray dark:text-white/[0.58]">
          Open Transactions for search, filters, and exports.
        </p>
      </aside>

      {data.recentTransactions.length > 0 ? (
        <RecentTransactions transactions={data.recentTransactions} />
      ) : (
        <EmptyState
          title={RECENT_ACCOUNT_ACTIVITY_EMPTY_TITLE}
          message="No transactions are available for the selected period."
        />
      )}
    </section>
  );
}
