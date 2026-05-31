"use client";

import { useState } from "react";
import { AdminStatCards } from "@/components/admin/AdminStatCards";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/lib/formatCurrency";
import { useAdminFinanceReports } from "@/hooks/useAdminFinanceReports";

function formatCountMap(map: Record<string, number>) {
  const entries = Object.entries(map);

  if (entries.length === 0) {
    return "None";
  }

  return entries.map(([key, value]) => `${key}: ${value}`).join(" · ");
}

export function AdminFinanceReportsClient() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { data, error, isLoading, isForbidden, refetch } = useAdminFinanceReports(
    from || undefined,
    to || undefined,
  );

  if (isLoading) {
    return <LoadingState title="Loading finance reports" message="Aggregating ledger and review metrics." />;
  }

  if (error) {
    return (
      <ApiErrorState
        message={isForbidden ? "Admin access required." : error}
        onRetry={isForbidden ? undefined : refetch}
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="Finance reports unavailable"
        message="Finance report data could not be loaded. Refresh the page or try again later."
      />
    );
  }

  return (
    <section className="grid gap-5">
      <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]">
        <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Date filters</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-primary-navy dark:text-white">From</span>
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-primary-navy dark:text-white">To</span>
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            />
          </label>
        </div>
      </article>

      <AdminStatCards
        items={[
          { label: "Total user balances", value: formatCurrency(data.totals.userBalances) },
          { label: "Ledger debits", value: formatCurrency(data.totals.ledgerDebits) },
          { label: "Ledger credits", value: formatCurrency(data.totals.ledgerCredits) },
          {
            label: "Pending review amount",
            value: formatCurrency(data.totals.pendingReviewAmount),
          },
        ]}
      />

      <AdminStatCards
        items={[
          {
            label: "Pending transfers",
            value: data.pendingReview.transfers,
            hint: formatCurrency(data.pendingReview.transferAmount),
          },
          {
            label: "Pending bill payments",
            value: data.pendingReview.billPayments,
            hint: formatCurrency(data.pendingReview.billPaymentAmount),
          },
          { label: "Support tickets", value: data.support.total },
          { label: "Risk events", value: data.risk.total },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]">
          <h3 className="font-semibold text-primary-navy dark:text-white">Transactions by status</h3>
          <p className="mt-3 text-sm text-bluewave-gray dark:text-white/[0.70]">
            {formatCountMap(data.transactionsByStatus)}
          </p>
        </article>

        <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]">
          <h3 className="font-semibold text-primary-navy dark:text-white">Bill payments by status</h3>
          <p className="mt-3 text-sm text-bluewave-gray dark:text-white/[0.70]">
            {formatCountMap(data.billPaymentsByStatus)}
          </p>
        </article>

        <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]">
          <h3 className="font-semibold text-primary-navy dark:text-white">Support volume</h3>
          <p className="mt-3 text-sm text-bluewave-gray dark:text-white/[0.70]">
            Status — {formatCountMap(data.support.byStatus)}
          </p>
          <p className="mt-2 text-sm text-bluewave-gray dark:text-white/[0.70]">
            Priority — {formatCountMap(data.support.byPriority)}
          </p>
        </article>

        <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]">
          <h3 className="font-semibold text-primary-navy dark:text-white">Risk summary</h3>
          <p className="mt-3 text-sm text-bluewave-gray dark:text-white/[0.70]">
            Severity — {formatCountMap(data.risk.bySeverity)}
          </p>
          <p className="mt-2 text-sm text-bluewave-gray dark:text-white/[0.70]">
            High/critical events: {data.risk.recentHighSeverity}
          </p>
        </article>
      </div>
    </section>
  );
}
