"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminStatCards } from "@/components/admin/AdminStatCards";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/lib/formatCurrency";
import { useAdminAdjustments } from "@/hooks/useAdminAdjustments";
import { cn } from "@/lib/utils";
import type { AdjustmentStatus, AdminAccountRecord } from "@/types/banking";

const filters: Array<AdjustmentStatus | "ALL"> = ["ALL", "PENDING", "APPROVED", "POSTED", "REJECTED"];

export function AdminAdjustmentsClient() {
  const [statusFilter, setStatusFilter] = useState<AdjustmentStatus | "ALL">("PENDING");
  const [accounts, setAccounts] = useState<AdminAccountRecord[]>([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<"DEBIT" | "CREDIT">("CREDIT");
  const [reason, setReason] = useState("");
  const { data, error, isLoading, isForbidden, isSubmitting, refetch, createAdjustment, actionAdjustment } =
    useAdminAdjustments(statusFilter);

  const fetchAccounts = useCallback(async () => {
    const response = await fetch("/api/admin/accounts", { credentials: "include", cache: "no-store" });
    const payload = (await response.json()) as {
      success: boolean;
      data?: { accounts: AdminAccountRecord[] };
    };

    if (payload.success && payload.data) {
      setAccounts(payload.data.accounts);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchAccounts();
      }
    });
    return () => controller.abort();
  }, [fetchAccounts]);

  if (isLoading) {
    return <LoadingState title="Loading adjustments" message="Retrieving controlled adjustment queue." />;
  }

  if (error) {
    return (
      <ApiErrorState
        message={isForbidden ? "Operations sign-in required." : error}
        onRetry={isForbidden ? undefined : refetch}
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="Adjustments unavailable"
        message="Balance adjustment records could not be loaded. Refresh the page or try again later."
      />
    );
  }

  return (
    <section className="grid gap-5">
      <article className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
        Controlled adjustments always create ledger entries. Direct balance edits are never allowed.
        Approve first, then post to apply the ledger movement.
      </article>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void createAdjustment({
            accountId,
            amount: Number(amount),
            direction,
            reason,
          }).then((ok) => {
            if (ok) {
              setAmount("");
              setReason("");
            }
          });
        }}
        className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]"
      >
        <h2 className="text-lg font-semibold">Create adjustment request</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold">Account</span>
            <select
              required
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
              className="mt-2 w-full rounded-lg border px-4 py-3 text-sm dark:bg-white/[0.06] dark:text-white"
            >
              <option value="">Select account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.user.fullName} — {account.displayName} ({account.maskedAccountNumber})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Direction</span>
            <select
              value={direction}
              onChange={(event) => setDirection(event.target.value as "DEBIT" | "CREDIT")}
              className="mt-2 w-full rounded-lg border px-4 py-3 text-sm dark:bg-white/[0.06] dark:text-white"
            >
              <option value="CREDIT">Credit</option>
              <option value="DEBIT">Debit</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Amount</span>
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="mt-2 w-full rounded-lg border px-4 py-3 text-sm dark:bg-white/[0.06] dark:text-white"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold">Reason</span>
            <input
              required
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-2 w-full rounded-lg border px-4 py-3 text-sm dark:bg-white/[0.06] dark:text-white"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 inline-flex h-11 items-center rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy"
        >
          Create request
        </button>
      </form>

      <AdminStatCards
        items={[
          { label: "Pending", value: data.summary.pending },
          { label: "Approved", value: data.summary.approved },
          { label: "Total", value: data.summary.total },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setStatusFilter(filter)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold",
              statusFilter === filter ? "bg-ocean-blue text-primary-navy" : "border bg-white dark:bg-white/[0.06] dark:text-white",
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {data.adjustments.map((adjustment) => (
          <article key={adjustment.id} className="rounded-lg border bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]">
            <p className="font-semibold">
              {adjustment.direction} {formatCurrency(adjustment.amount)} — {adjustment.userName}
            </p>
            <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.62]">
              {adjustment.reason} · {adjustment.status}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {adjustment.status === "PENDING" ? (
                <>
                  <button type="button" disabled={isSubmitting} onClick={() => void actionAdjustment(adjustment.id, "APPROVE")} className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold">Approve</button>
                  <button type="button" disabled={isSubmitting} onClick={() => void actionAdjustment(adjustment.id, "REJECT")} className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold">Reject</button>
                </>
              ) : null}
              {adjustment.status === "APPROVED" ? (
                <button type="button" disabled={isSubmitting} onClick={() => void actionAdjustment(adjustment.id, "POST")} className="rounded-full bg-ocean-blue px-3 py-1 text-xs font-semibold text-primary-navy">Post to ledger</button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
