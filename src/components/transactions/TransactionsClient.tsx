"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Repeat2,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { DetailDrawer } from "@/components/ui/DetailDrawer";
import { Amount } from "@/components/ui/Amount";
import { DateTime } from "@/components/ui/DateTime";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { AccountNumberDisplay } from "@/components/shared/AccountNumberDisplay";
import { formatCurrency } from "@/lib/formatCurrency";
import { MEMBER_STATEMENTS_PATH } from "@/lib/memberRoutes";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { cn } from "@/lib/utils";
import type { PageTransaction, TransactionStatus, TransactionType } from "@/types/banking";

const statusFilters: Array<{ label: string; value?: TransactionStatus }> = [
  { label: "All statuses", value: undefined },
  { label: "Pending", value: "PENDING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Failed", value: "FAILED" },
  { label: "Reversed", value: "REVERSED" },
];

const typeFilters: Array<{ label: string; value?: TransactionType }> = [
  { label: "All types", value: undefined },
  { label: "Deposits", value: "DEPOSIT" },
  { label: "Withdrawals", value: "WITHDRAWAL" },
  { label: "Transfers", value: "TRANSFER" },
  { label: "Payments", value: "PAYMENT" },
  { label: "Card", value: "CARD" },
];

const fieldClassName =
  "mt-1.5 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-3 py-2.5 text-sm text-primary-navy outline-none focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white";

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

function getTransactionDisplayDate(transaction: PageTransaction) {
  return transaction.postedAt ?? transaction.createdAt;
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

type TransactionFiltersMenuProps = {
  accounts: Array<{ id: string; displayName: string; maskedAccountNumber: string }>;
  selectedAccountId: string;
  selectedStatus?: TransactionStatus;
  selectedType?: TransactionType;
  onAccountChange: (accountId: string) => void;
  onStatusChange: (status?: TransactionStatus) => void;
  onTypeChange: (type?: TransactionType) => void;
  onClear: () => void;
  activeFilterCount: number;
};

function TransactionFiltersMenu({
  accounts,
  selectedAccountId,
  selectedStatus,
  selectedType,
  onAccountChange,
  onStatusChange,
  onTypeChange,
  onClear,
  activeFilterCount,
}: TransactionFiltersMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition sm:px-4",
          open || activeFilterCount > 0
            ? "border-ocean-blue/[0.35] bg-ocean-blue/[0.10] text-royal-blue dark:text-light-blue"
            : "border-primary-navy/[0.08] bg-white text-primary-navy hover:border-ocean-blue/[0.35] dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-white",
        )}
      >
        <SlidersHorizontal size={16} aria-hidden="true" />
        Filters
        {activeFilterCount > 0 ? (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ocean-blue px-1.5 text-[11px] font-bold text-primary-navy">
            {activeFilterCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[min(92vw,320px)] rounded-xl border border-primary-navy/[0.08] bg-white p-4 shadow-[0_24px_70px_rgba(10,42,94,0.16)] dark:border-white/[0.08] dark:bg-[#071526]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-primary-navy dark:text-white">Filter activity</p>
            {activeFilterCount > 0 ? (
              <button
                type="button"
                onClick={() => {
                  onClear();
                  setOpen(false);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-royal-blue hover:text-ocean-blue dark:text-light-blue"
              >
                <X size={14} aria-hidden="true" />
                Clear
              </button>
            ) : null}
          </div>

          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-bluewave-gray dark:text-white/[0.52]">
              Account
            </span>
            <select
              value={selectedAccountId}
              onChange={(event) => onAccountChange(event.target.value)}
              className={fieldClassName}
            >
              <option value="">All accounts</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.displayName} ({account.maskedAccountNumber})
                </option>
              ))}
            </select>
          </label>

          <label className="mt-3 block">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-bluewave-gray dark:text-white/[0.52]">
              Status
            </span>
            <select
              value={selectedStatus ?? ""}
              onChange={(event) =>
                onStatusChange(
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

          <label className="mt-3 block">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-bluewave-gray dark:text-white/[0.52]">
              Type
            </span>
            <select
              value={selectedType ?? ""}
              onChange={(event) =>
                onTypeChange(event.target.value ? (event.target.value as TransactionType) : undefined)
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

          <Link
            href={MEMBER_STATEMENTS_PATH}
            onClick={() => setOpen(false)}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-royal-blue dark:text-light-blue"
          >
            <Download size={15} aria-hidden="true" />
            Export statements
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function TransactionsClient() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q")?.trim() ?? "";
  const { data: accountsData } = useAccounts();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus | undefined>();
  const [selectedType, setSelectedType] = useState<TransactionType | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<PageTransaction | null>(null);
  const activeSearchQuery = searchQuery || urlQuery;

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
    const query = activeSearchQuery.toLowerCase();

    if (!query) {
      return rows;
    }

    return rows.filter(
      (transaction) =>
        transaction.description.toLowerCase().includes(query) ||
        (transaction.merchant?.toLowerCase().includes(query) ?? false) ||
        transaction.reference.toLowerCase().includes(query),
    );
  }, [data?.transactions, activeSearchQuery]);

  const activeFilterCount = [selectedAccountId, selectedStatus, selectedType].filter(Boolean).length;
  const hasPendingItems = (data?.transactions ?? []).some(
    (transaction) => transaction.status === "PENDING",
  );

  function clearFilters() {
    setSelectedAccountId("");
    setSelectedStatus(undefined);
    setSelectedType(undefined);
  }

  if (isLoading) {
    return (
      <LoadingState
        title="Loading transactions"
        message="Retrieving your transaction activity."
      />
    );
  }

  if (error) {
    return <ApiErrorState message={error} onRetry={refetch} />;
  }

  return (
    <section className="grid gap-4">
      {hasPendingItems ? (
        <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm leading-6 text-amber-950 dark:text-amber-100">
          Pending transfers and payments are reviewed before they post to your balance.
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search transactions</span>
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-bluewave-gray dark:text-white/[0.45]"
          />
          <input
            value={searchQuery || urlQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search merchant, description, or reference"
            className="h-10 w-full rounded-full border border-primary-navy/[0.08] bg-white pl-10 pr-4 text-sm text-primary-navy outline-none focus:border-ocean-blue dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-white"
          />
        </label>

        <TransactionFiltersMenu
          accounts={accountsData?.accounts ?? []}
          selectedAccountId={selectedAccountId}
          selectedStatus={selectedStatus}
          selectedType={selectedType}
          onAccountChange={setSelectedAccountId}
          onStatusChange={setSelectedStatus}
          onTypeChange={setSelectedType}
          onClear={clearFilters}
          activeFilterCount={activeFilterCount}
        />
      </div>

      <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">
        {transactions.length} {transactions.length === 1 ? "transaction" : "transactions"}, newest first
        {activeSearchQuery ? ` · matching “${activeSearchQuery}”` : ""}
      </p>

      {transactions.length > 0 ? (
        <section className="rounded-lg border border-primary-navy/[0.08] bg-white shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
          <div className="divide-y divide-primary-navy/[0.08] px-4 dark:divide-white/[0.08] sm:px-5">
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
                  className="flex cursor-pointer items-start gap-4 py-4 transition hover:bg-ocean-blue/[0.04] first:pt-4 last:pb-4"
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      positive
                        ? "bg-ocean-blue/[0.12] text-royal-blue"
                        : "bg-primary-navy/[0.06] text-primary-navy dark:bg-white/[0.08] dark:text-light-blue",
                    )}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-primary-navy dark:text-white">
                          {transaction.merchant ?? transaction.description}
                        </h3>
                        <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                          {formatTransactionDate(getTransactionDisplayDate(transaction))} · {transaction.maskedAccountNumber}
                        </p>
                        {transaction.merchant && transaction.description !== transaction.merchant ? (
                          <p className="mt-1 text-xs text-bluewave-gray dark:text-white/[0.52]">
                            {transaction.description}
                          </p>
                        ) : null}
                        {transaction.postedAt ? (
                          <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                            Posted {formatReviewDate(transaction.postedAt)}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
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
                            "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
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
          message="Try adjusting filters or search for a different merchant, description, or reference."
        />
      )}

      <DetailDrawer
        open={Boolean(selectedTransaction)}
        title={selectedTransaction?.description ?? "Transaction"}
        subtitle={selectedTransaction?.reference}
        onClose={() => setSelectedTransaction(null)}
        footer={
          selectedTransaction?.status === "COMPLETED" ? (
            <Link
              href="/auth/disputes"
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
                <DateTime value={getTransactionDisplayDate(selectedTransaction)} variant="datetime" />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-bluewave-gray dark:text-white/[0.58]">Account</dt>
              <dd>
                <AccountNumberDisplay accountNumber={selectedTransaction.maskedAccountNumber} />
              </dd>
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
