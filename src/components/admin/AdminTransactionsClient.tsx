"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/lib/formatCurrency";
import { useAdminTransactions } from "@/hooks/useAdminTransactions";
import { cn } from "@/lib/utils";
import type { AdminTransactionRecord, TransactionStatus, TransactionType } from "@/types/banking";

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

const reviewActions: Array<{
  status: Extract<TransactionStatus, "COMPLETED" | "FAILED" | "REVERSED">;
  label: string;
  confirm: string;
}> = [
  {
    status: "COMPLETED",
    label: "Approve",
    confirm:
      "Approving this transfer will post ledger entries and update balances. Continue?",
  },
  {
    status: "FAILED",
    label: "Fail",
    confirm: "Mark this pending transfer as failed? Balances will not change.",
  },
  {
    status: "REVERSED",
    label: "Reverse",
    confirm: "Reverse this pending transfer review? Balances will not change.",
  },
];

function getStatusLabel(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatReviewDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
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

function TransactionReviewCard({
  transaction,
  isUpdating,
  onReview,
  onDelay,
}: {
  transaction: AdminTransactionRecord;
  isUpdating: boolean;
  onReview: (
    transactionId: string,
    status: Extract<TransactionStatus, "COMPLETED" | "FAILED" | "REVERSED">,
    confirmMessage: string,
  ) => void;
  onDelay: (transactionId: string) => void;
}) {
  const canReview =
    transaction.status === "PENDING" &&
    transaction.type === "TRANSFER" &&
    !transaction.postedAt;

  return (
    <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
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
          {transaction.postedAt ? (
            <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Posted {formatReviewDate(transaction.postedAt)}
            </p>
          ) : null}
          {transaction.reviewedAt ? (
            <p className="mt-1 text-xs text-bluewave-gray dark:text-white/[0.48]">
              Reviewed {formatReviewDate(transaction.reviewedAt)}
            </p>
          ) : null}
          {transaction.reviewNote ? (
            <p className="mt-2 text-sm text-bluewave-gray dark:text-white/[0.58]">
              Review note: {transaction.reviewNote}
            </p>
          ) : null}
          {transaction.delayedAt ? (
            <p className="mt-2 text-sm font-medium text-amber-700 dark:text-amber-300">
              Marked delayed {formatReviewDate(transaction.delayedAt)}
            </p>
          ) : null}
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

      {canReview ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {reviewActions.map((action) => (
            <button
              key={`${transaction.id}-${action.status}`}
              type="button"
              disabled={isUpdating || Boolean(transaction.postedAt)}
              onClick={() => onReview(transaction.id, action.status, action.confirm)}
              className="rounded-full border border-primary-navy/[0.08] px-3 py-1.5 text-xs font-semibold transition hover:border-ocean-blue disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.08]"
            >
              {action.label}
            </button>
          ))}
          <button
            type="button"
            disabled={isUpdating || Boolean(transaction.delayedAt)}
            onClick={() => onDelay(transaction.id)}
            className="rounded-full border border-amber-500/[0.20] px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:border-amber-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-amber-300"
          >
            Mark delayed
          </button>
        </div>
      ) : (
        <p className="mt-4 text-xs font-medium text-bluewave-gray dark:text-white/[0.48]">
          {transaction.postedAt
            ? "This transfer has already been posted to the ledger."
            : "Review actions are available only for pending transfer requests."}
        </p>
      )}
    </article>
  );
}

export function AdminTransactionsClient({ reviewOnly = false }: { reviewOnly?: boolean }) {
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus | undefined>(
    reviewOnly ? "PENDING" : undefined,
  );
  const [selectedType, setSelectedType] = useState<TransactionType | undefined>(
    reviewOnly ? "TRANSFER" : undefined,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    markTransactionDelayed,
  } = useAdminTransactions(filters);

  async function handleDelay(transactionId: string) {
    const reviewNote = window.prompt("Optional delay note for the member (leave blank to skip):")?.trim();
    const success = await markTransactionDelayed(transactionId, reviewNote || undefined);

    if (success) {
      setSuccessMessage("Transfer marked delayed and member notified.");
    }
  }

  async function handleReview(
    transactionId: string,
    status: Extract<TransactionStatus, "COMPLETED" | "FAILED" | "REVERSED">,
    confirmMessage: string,
  ) {
    const confirmed = window.confirm(confirmMessage);

    if (!confirmed) {
      return;
    }

    const reviewNote = window.prompt("Optional review note (leave blank to skip):")?.trim();

    const success = await updateTransactionStatus(
      transactionId,
      status,
      reviewNote || undefined,
    );

    if (success) {
      setSuccessMessage(
        status === "COMPLETED"
          ? "Transfer approved and posted to the ledger."
          : `Transfer marked as ${getStatusLabel(status).toLowerCase()}.`,
      );
      await refetch();
    }
  }

  if (isLoading) {
    return (
      <LoadingState title="Loading transactions" message="Retrieving transaction review queue." />
    );
  }

  if (error) {
    return (
      <ApiErrorState
        message={isForbidden ? "Operations sign-in required." : error}
        onRetry={isForbidden ? undefined : refetch}
      />
    );
  }

  const transactions = data?.transactions ?? [];
  const pendingTransfers = transactions.filter(
    (transaction) => transaction.status === "PENDING" && transaction.type === "TRANSFER",
  );
  const otherTransactions = transactions.filter(
    (transaction) => !(transaction.status === "PENDING" && transaction.type === "TRANSFER"),
  );

  const fieldClassName =
    "mt-1.5 w-full min-w-[10rem] rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-3 py-2.5 text-sm font-semibold text-primary-navy outline-none focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white";

  return (
    <section className="grid gap-5">
      {!reviewOnly ? (
        <div className="flex flex-col gap-4 rounded-lg border border-primary-navy/[0.08] bg-white p-4 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06] sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-[12rem] flex-1">
            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-bluewave-gray dark:text-white/[0.52]">
              Filters
            </label>
            <label className="mt-3 block">
              <span className="text-sm font-semibold text-primary-navy dark:text-white">Status</span>
              <select
                value={selectedStatus ?? ""}
                onChange={(event) =>
                  setSelectedStatus(
                    event.target.value ? (event.target.value as TransactionStatus) : undefined,
                  )
                }
                className={fieldClassName}
              >
                {statusFilters.map((filter) => (
                  <option key={filter.label} value={filter.value ?? ""}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block min-w-[12rem] flex-1">
            <span className="text-sm font-semibold text-primary-navy dark:text-white">Type</span>
            <select
              value={selectedType ?? ""}
              onChange={(event) =>
                setSelectedType(
                  event.target.value ? (event.target.value as TransactionType) : undefined,
                )
              }
              className={fieldClassName}
            >
              {typeFilters.map((filter) => (
                <option key={filter.label} value={filter.value ?? ""}>
                  {filter.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      <div className="grid gap-5">
        {successMessage ? (
          <p
            role="status"
            className="rounded-lg border border-ocean-blue/[0.20] bg-ocean-blue/[0.08] px-4 py-3 text-sm font-medium text-royal-blue dark:text-light-blue"
          >
            {successMessage}
          </p>
        ) : null}

        {updateError ? (
          <p className="rounded-lg border border-red-500/[0.20] bg-red-500/[0.08] px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
            {updateError}
          </p>
        ) : null}

        <section className="grid gap-4">
          <div>
            <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
              Pending Transfer Review
            </h2>
            <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
              Review transfer requests before posting. Approving a transfer posts ledger entries
              and updates balances.
            </p>
          </div>

          {pendingTransfers.length > 0 ? (
            pendingTransfers.map((transaction) => (
              <TransactionReviewCard
                key={transaction.id}
                transaction={transaction}
                isUpdating={isUpdating}
                onReview={(transactionId, status, confirmMessage) =>
                  void handleReview(transactionId, status, confirmMessage)
                }
                onDelay={(transactionId) => void handleDelay(transactionId)}
              />
            ))
          ) : (
            <EmptyState
              title="No pending transfers"
              message="Pending transfer requests will appear here for review."
            />
          )}
        </section>

        <section className="grid gap-4">
          <div>
            <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
              All Transactions
            </h2>
            <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
              Completed, failed, reversed, and non-transfer activity.
            </p>
          </div>

          {otherTransactions.length > 0 ? (
            otherTransactions.map((transaction) => (
              <TransactionReviewCard
                key={transaction.id}
                transaction={transaction}
                isUpdating={isUpdating}
                onReview={(transactionId, status, confirmMessage) =>
                  void handleReview(transactionId, status, confirmMessage)
                }
                onDelay={(transactionId) => void handleDelay(transactionId)}
              />
            ))
          ) : (
            <EmptyState title="No other transactions" message="No transactions match your filters." />
          )}
        </section>
      </div>
    </section>
  );
}
