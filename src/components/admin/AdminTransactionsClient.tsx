"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/data/mockBanking";
import { useAdminTransactions } from "@/hooks/useAdminTransactions";
import { cn } from "@/lib/utils";
import type { TransactionStatus, TransactionType } from "@/types/banking";

const statusFilters: Array<{ label: string; value?: TransactionStatus }> = [
  { label: "All statuses" },
  { label: "Pending", value: "PENDING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Failed", value: "FAILED" },
  { label: "Reversed", value: "REVERSED" },
];

const typeFilters: Array<{ label: string; value?: TransactionType }> = [
  { label: "All types" },
  { label: "Transfer", value: "TRANSFER" },
  { label: "Deposit", value: "DEPOSIT" },
  { label: "Payment", value: "PAYMENT" },
  { label: "Card", value: "CARD" },
];

const pendingActions: Array<Extract<TransactionStatus, "COMPLETED" | "FAILED" | "REVERSED">> = [
  "COMPLETED",
  "FAILED",
  "REVERSED",
];

function getStatusLabel(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusBadgeClass(status: TransactionStatus) {
  if (status === "COMPLETED") {
    return "bg-ocean-blue/[0.10] text-royal-blue dark:text-light-blue";
  }

  if (status === "PENDING") {
    return "bg-amber-500/[0.12] text-amber-700 dark:text-amber-300";
  }

  if (status === "FAILED") {
    return "bg-red-500/[0.12] text-red-700 dark:text-red-300";
  }

  return "bg-primary-navy/[0.06] text-primary-navy dark:bg-white/[0.08] dark:text-white";
}

export function AdminTransactionsClient() {
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus | undefined>();
  const [selectedType, setSelectedType] = useState<TransactionType | undefined>();

  const filters = useMemo(
    () => ({
      status: selectedStatus,
      type: selectedType,
    }),
    [selectedStatus, selectedType],
  );

  const {
    data,
    error,
    isLoading,
    isForbidden,
    isUpdating,
    updateError,
    refetch,
    updateTransactionStatus,
  } = useAdminTransactions(filters);

  if (isLoading) {
    return (
      <LoadingState title="Loading transactions" message="Retrieving transaction review queue." />
    );
  }

  if (error) {
    return (
      <ApiErrorState
        message={isForbidden ? "Admin access required. Sign in with a demo admin account." : error}
        onRetry={isForbidden ? undefined : refetch}
      />
    );
  }

  const transactions = data?.transactions ?? [];

  return (
    <section className="grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
      <aside className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
        <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Filters</h2>
        <div className="mt-4 grid gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => setSelectedStatus(filter.value)}
              className={cn(
                "rounded-lg border px-4 py-3 text-left text-sm font-semibold transition",
                selectedStatus === filter.value
                  ? "border-ocean-blue bg-ocean-blue/[0.10] text-royal-blue dark:text-light-blue"
                  : "border-primary-navy/[0.08] bg-[#f7fbff] text-primary-navy dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="mt-5 grid gap-2">
          {typeFilters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => setSelectedType(filter.value)}
              className={cn(
                "rounded-lg border px-4 py-3 text-left text-sm font-semibold transition",
                selectedType === filter.value
                  ? "border-ocean-blue bg-ocean-blue/[0.10] text-royal-blue dark:text-light-blue"
                  : "border-primary-navy/[0.08] bg-[#f7fbff] text-primary-navy dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </aside>

      <div className="grid gap-4">
        {updateError ? (
          <p className="rounded-lg border border-red-500/[0.20] bg-red-500/[0.08] px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
            {updateError}
          </p>
        ) : null}

        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <article
              key={transaction.id}
              className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="font-semibold text-primary-navy dark:text-white">
                    {transaction.merchant ?? transaction.description}
                  </h3>
                  <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                    {transaction.user.fullName} | {transaction.account.maskedAccountNumber}
                  </p>
                  <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                    {getStatusLabel(transaction.type)} | {transaction.reference}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2 lg:items-end">
                  <p className="text-lg font-semibold text-primary-navy dark:text-white">
                    {formatCurrency(Math.abs(transaction.amount))}
                  </p>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      getStatusBadgeClass(transaction.status),
                    )}
                  >
                    {getStatusLabel(transaction.status)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {pendingActions.map((status) => (
                  <button
                    key={`${transaction.id}-${status}`}
                    type="button"
                    disabled={isUpdating || transaction.status !== "PENDING"}
                    onClick={() => void updateTransactionStatus(transaction.id, status)}
                    className="rounded-full border border-primary-navy/[0.08] px-3 py-1.5 text-xs font-semibold transition hover:border-ocean-blue disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.08]"
                  >
                    Mark {getStatusLabel(status)}
                  </button>
                ))}
              </div>
            </article>
          ))
        ) : (
          <EmptyState title="No transactions found" message="Adjust filters or seed demo transactions." />
        )}
      </div>
    </section>
  );
}
