"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Download, ReceiptText, Repeat2 } from "lucide-react";
import { DetailDrawer } from "@/components/ui/DetailDrawer";
import { Amount } from "@/components/ui/Amount";
import { DateTime } from "@/components/ui/DateTime";
import { InfoPanel } from "@/components/ui/InfoPanel";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/lib/formatCurrency";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { cn } from "@/lib/utils";
import type { PageTransaction, TransactionStatus, TransactionType } from "@/types/banking";

const statusFilters: Array<{ label: string; value?: TransactionStatus }> = [
  { label: "All statuses" },
  { label: "Pending", value: "PENDING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Failed", value: "FAILED" },
  { label: "Reversed", value: "REVERSED" },
];

const typeFilters: Array<{ label: string; value?: TransactionType }> = [
  { label: "All types" },
  { label: "Deposits", value: "DEPOSIT" },
  { label: "Withdrawals", value: "WITHDRAWAL" },
  { label: "Transfers", value: "TRANSFER" },
  { label: "Payments", value: "PAYMENT" },
  { label: "Card", value: "CARD" },
];

const transactionIcons = {
  credit: ArrowDownLeft,
  debit: ArrowUpRight,
  transfer: Repeat2,
};

function getStatusLabel(status: string, type?: TransactionType) {
  if (status === "PENDING" && type === "TRANSFER") {
    return "Pending Review";
  }

  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getDisplayStatus(transaction: {
  status: TransactionStatus;
  type: TransactionType;
  postedAt?: string | null;
  ledgerSummary?: { posted: boolean };
}) {
  if (transaction.status === "COMPLETED" && transaction.type === "TRANSFER" && transaction.ledgerSummary?.posted) {
    return "Posted";
  }

  return getStatusLabel(transaction.status, transaction.type);
}

function formatReviewDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatTransactionDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getTransactionKind(type: TransactionType, amount: number) {
  if (type === "TRANSFER") {
    return "transfer";
  }

  if (amount > 0 || type === "DEPOSIT" || type === "REFUND") {
    return "credit";
  }

  return "debit";
}

function getStatusBadgeClass(status: TransactionStatus) {
  if (status === "COMPLETED") {
    return "bg-emerald-500/[0.12] text-emerald-700 dark:text-emerald-300";
  }

  if (status === "PENDING") {
    return "bg-amber-500/[0.12] text-amber-700 dark:text-amber-300";
  }

  if (status === "FAILED") {
    return "bg-red-500/[0.12] text-red-700 dark:text-red-300";
  }

  return "bg-primary-navy/[0.06] text-primary-navy dark:bg-white/[0.08] dark:text-white";
}

export function TransactionsClient() {
  const { data: accountsData } = useAccounts();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus | undefined>();
  const [selectedType, setSelectedType] = useState<TransactionType | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<PageTransaction | null>(null);

  const filters = useMemo(
    () => ({
      accountId: selectedAccountId || undefined,
      status: selectedStatus,
      type: selectedType,
      limit: 100,
    }),
    [selectedAccountId, selectedStatus, selectedType],
  );

  const { data, error, isLoading, refetch } = useTransactions(filters);

  const transactions = useMemo(() => {
    const rows = data?.transactions ?? [];
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return rows;
    }

    return rows.filter(
      (transaction) =>
        transaction.description.toLowerCase().includes(query) ||
        (transaction.merchant?.toLowerCase().includes(query) ?? false) ||
        transaction.reference.toLowerCase().includes(query),
    );
  }, [data?.transactions, searchQuery]);

  if (isLoading) {
    return (
      <LoadingState
        title="Loading transactions"
        message="Retrieving authenticated transaction activity."
      />
    );
  }

  if (error) {
    return <ApiErrorState message={error} onRetry={refetch} />;
  }

  return (
    <section className="grid gap-5">
      <InfoPanel title="Pending review">
        Transfer and payment requests remain pending until an administrator reviews and approves
        ledger posting.
      </InfoPanel>

      <div className="grid gap-5 xl:grid-cols-[0.68fr_1.32fr]">
      <aside className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
        <ReceiptText size={24} className="text-ocean-blue" aria-hidden="true" />
        <h2 className="mt-5 text-lg font-semibold text-primary-navy dark:text-white">Filters</h2>

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-primary-navy dark:text-white">Search</span>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Merchant, description, reference"
            className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm text-primary-navy outline-none focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
          />
        </label>

        <Link
          href="/statements"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-royal-blue dark:text-light-blue"
        >
          <Download size={16} aria-hidden="true" />
          Export statements
        </Link>

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-primary-navy dark:text-white">Account</span>
          <select
            value={selectedAccountId}
            onChange={(event) => setSelectedAccountId(event.target.value)}
            className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm text-primary-navy outline-none focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
          >
            <option value="">All accounts</option>
            {accountsData?.accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.displayName} ({account.maskedAccountNumber})
              </option>
            ))}
          </select>
        </label>

        <div className="mt-5">
          <p className="text-sm font-semibold text-primary-navy dark:text-white">Status</p>
          <div className="mt-3 grid gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.label}
                type="button"
                onClick={() => setSelectedStatus(filter.value)}
                className={cn(
                  "rounded-lg border px-4 py-3 text-left text-sm font-semibold transition",
                  selectedStatus === filter.value
                    ? "border-ocean-blue bg-ocean-blue/[0.10] text-royal-blue dark:text-light-blue"
                    : "border-primary-navy/[0.08] bg-[#f7fbff] text-primary-navy hover:border-ocean-blue/[0.40] dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold text-primary-navy dark:text-white">Type</p>
          <div className="mt-3 grid gap-2">
            {typeFilters.map((filter) => (
              <button
                key={filter.label}
                type="button"
                onClick={() => setSelectedType(filter.value)}
                className={cn(
                  "rounded-lg border px-4 py-3 text-left text-sm font-semibold transition",
                  selectedType === filter.value
                    ? "border-ocean-blue bg-ocean-blue/[0.10] text-royal-blue dark:text-light-blue"
                    : "border-primary-navy/[0.08] bg-[#f7fbff] text-primary-navy hover:border-ocean-blue/[0.40] dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-5 text-sm leading-6 text-bluewave-gray dark:text-white/[0.58]">
          Showing {transactions.length} authenticated records, newest first.
        </p>
      </aside>

      {transactions.length > 0 ? (
        <section className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
          <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
            Transaction history
          </h2>
          <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
            Authenticated activity from your Bluewave accounts. Transfer requests are reviewed
            before completion.
          </p>

          <div className="mt-5 divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
            {transactions.map((transaction) => {
              const kind = getTransactionKind(transaction.type, transaction.amount);
              const Icon = transactionIcons[kind];
              const positive = transaction.amount > 0;

              return (
                <article
                  key={transaction.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedTransaction(transaction)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      setSelectedTransaction(transaction);
                    }
                  }}
                  className="flex cursor-pointer items-start gap-4 py-4 first:pt-0 last:pb-0 hover:bg-ocean-blue/[0.04]"
                >
                  <span
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
                      positive
                        ? "bg-ocean-blue/[0.12] text-royal-blue"
                        : "bg-primary-navy/[0.06] text-primary-navy dark:bg-white/[0.08] dark:text-light-blue",
                    )}
                  >
                    <Icon size={19} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-primary-navy dark:text-white">
                          {transaction.merchant ?? transaction.description}
                        </h3>
                        <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                          {formatTransactionDate(transaction.createdAt)} |{" "}
                          {transaction.description} | {transaction.maskedAccountNumber}
                        </p>
                        {transaction.postedAt ? (
                          <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                            Posted {formatReviewDate(transaction.postedAt)}
                          </p>
                        ) : null}
                        {transaction.reviewNote ? (
                          <p className="mt-1 text-xs text-bluewave-gray dark:text-white/[0.48]">
                            Review note: {transaction.reviewNote}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-col items-start gap-2 sm:items-end">
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            positive
                              ? "text-royal-blue dark:text-light-blue"
                              : "text-primary-navy dark:text-white",
                          )}
                        >
                          {positive ? "+" : "-"}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </p>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            getStatusBadgeClass(transaction.status),
                          )}
                        >
                          {getDisplayStatus(transaction)}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : (
        <EmptyState
          title="No transactions found"
          message="No transactions match your current filters."
        />
      )}
      </div>

      <DetailDrawer
        open={Boolean(selectedTransaction)}
        title={selectedTransaction?.description ?? "Transaction"}
        subtitle={selectedTransaction?.reference}
        onClose={() => setSelectedTransaction(null)}
        footer={
          selectedTransaction?.status === "COMPLETED" ? (
            <Link
              href="/disputes"
              className="inline-flex h-10 items-center rounded-full bg-ocean-blue px-4 text-sm font-semibold text-primary-navy"
            >
              Dispute transaction
            </Link>
          ) : null
        }
      >
        {selectedTransaction ? (
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-bluewave-gray dark:text-white/[0.58]">Amount</dt>
              <dd>
                <Amount value={selectedTransaction.amount} />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-bluewave-gray dark:text-white/[0.58]">Status</dt>
              <dd className="font-semibold">{getDisplayStatus(selectedTransaction)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-bluewave-gray dark:text-white/[0.58]">Date</dt>
              <dd>
                <DateTime value={selectedTransaction.createdAt} variant="datetime" />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-bluewave-gray dark:text-white/[0.58]">Account</dt>
              <dd className="font-semibold">{selectedTransaction.maskedAccountNumber}</dd>
            </div>
            {selectedTransaction.reviewedAt ? (
              <div className="flex justify-between gap-4">
                <dt className="text-bluewave-gray dark:text-white/[0.58]">Reviewed</dt>
                <dd>
                  <DateTime value={selectedTransaction.reviewedAt} variant="datetime" />
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </DetailDrawer>
    </section>
  );
}
