"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminStatCards } from "@/components/admin/AdminStatCards";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/lib/formatCurrency";
import { useAdminAdjustments } from "@/hooks/useAdminAdjustments";
import { cn } from "@/lib/utils";
import type {
  AdjustmentStatus,
  AdminAccountRecord,
  AdminUserSummaryWithKyc,
} from "@/types/banking";

const filters: Array<AdjustmentStatus | "ALL"> = [
  "ALL",
  "PENDING",
  "APPROVED",
  "SCHEDULED",
  "POSTED",
  "REJECTED",
];

const fieldClassName =
  "mt-1.5 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-3 py-2.5 text-sm text-primary-navy outline-none focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white";

function formatDateTimeLocalValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function formatEffectiveAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AdminAdjustmentsClient() {
  const [statusFilter, setStatusFilter] = useState<AdjustmentStatus | "ALL">("PENDING");
  const [users, setUsers] = useState<AdminUserSummaryWithKyc[]>([]);
  const [accounts, setAccounts] = useState<AdminAccountRecord[]>([]);
  const [userId, setUserId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<"DEBIT" | "CREDIT">("CREDIT");
  const [reason, setReason] = useState("");
  const [effectiveAt, setEffectiveAt] = useState(() => formatDateTimeLocalValue(new Date()));
  const { data, error, isLoading, isForbidden, isSubmitting, refetch, createAdjustment, actionAdjustment } =
    useAdminAdjustments(statusFilter);

  const fetchUsers = useCallback(async () => {
    const response = await fetch("/api/admin/users?role=USER", {
      credentials: "include",
      cache: "no-store",
    });
    const payload = (await response.json()) as {
      success: boolean;
      data?: { users: AdminUserSummaryWithKyc[] };
    };

    if (payload.success && payload.data) {
      setUsers(payload.data.users.filter((user) => user.status === "ACTIVE"));
    }
  }, []);

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
        void fetchUsers();
        void fetchAccounts();
      }
    });
    return () => controller.abort();
  }, [fetchAccounts, fetchUsers]);

  const userAccounts = useMemo(() => {
    if (!userId) {
      return accounts;
    }

    return accounts.filter((account) => account.user.id === userId);
  }, [accounts, userId]);

  useEffect(() => {
    if (!accountId || userAccounts.some((account) => account.id === accountId)) {
      return;
    }

    queueMicrotask(() => {
      setAccountId("");
    });
  }, [accountId, userAccounts]);

  if (isLoading) {
    return <LoadingState title="Loading adjustments" message="Retrieving credit and debit queue." />;
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
        message="Credit and debit records could not be loaded."
      />
    );
  }

  return (
    <section className="grid gap-5">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void createAdjustment({
            accountId,
            amount: Number(amount),
            direction,
            reason,
            effectiveAt: new Date(effectiveAt).toISOString(),
          }).then((ok) => {
            if (ok) {
              setAmount("");
              setReason("");
              setEffectiveAt(formatDateTimeLocalValue(new Date()));
            }
          });
        }}
        className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]"
      >
        <h2 className="text-lg font-semibold">Credit or debit member account</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold">Member</span>
            <select
              required
              value={userId}
              onChange={(event) => {
                setUserId(event.target.value);
                setAccountId("");
              }}
              className={fieldClassName}
            >
              <option value="">Select member</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName} ({user.username})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Account</span>
            <select
              required
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
              disabled={!userId}
              className={fieldClassName}
            >
              <option value="">Select account</option>
              {userAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.displayName} ({account.maskedAccountNumber})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Direction</span>
            <select
              value={direction}
              onChange={(event) => setDirection(event.target.value as "DEBIT" | "CREDIT")}
              className={fieldClassName}
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
              className={fieldClassName}
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-semibold">Effective date and time</span>
            <input
              required
              type="datetime-local"
              value={effectiveAt}
              onChange={(event) => setEffectiveAt(event.target.value)}
              className={fieldClassName}
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-semibold">Reason</span>
            <input
              required
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Why this credit or debit is being applied"
              className={fieldClassName}
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 inline-flex h-10 items-center rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy disabled:opacity-70"
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
              statusFilter === filter
                ? "bg-ocean-blue text-primary-navy"
                : "border bg-white dark:bg-white/[0.06] dark:text-white",
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-primary-navy/[0.08] bg-white dark:border-white/[0.08] dark:bg-white/[0.06]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-primary-navy/[0.08] bg-[#f7fbff] text-xs uppercase tracking-[0.12em] text-bluewave-gray dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/[0.52]">
            <tr>
              <th className="px-4 py-3 font-semibold">Member</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Reason</th>
              <th className="px-4 py-3 font-semibold">Effective</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
            {data.adjustments.map((adjustment) => {
              const isFuture = new Date(adjustment.effectiveAt) > new Date();

              return (
                <tr key={adjustment.id}>
                  <td className="px-4 py-3 font-semibold">{adjustment.userName}</td>
                  <td className="px-4 py-3">{adjustment.direction}</td>
                  <td className="px-4 py-3">{formatCurrency(adjustment.amount)}</td>
                  <td className="max-w-xs px-4 py-3 text-bluewave-gray dark:text-white/[0.62]">
                    {adjustment.reason}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatEffectiveAt(adjustment.effectiveAt)}
                  </td>
                  <td className="px-4 py-3">{adjustment.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {adjustment.status === "PENDING" ? (
                        <>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => void actionAdjustment(adjustment.id, "APPROVE")}
                            className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => void actionAdjustment(adjustment.id, "REJECT")}
                            className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold"
                          >
                            Reject
                          </button>
                        </>
                      ) : null}
                      {adjustment.status === "APPROVED" ? (
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => void actionAdjustment(adjustment.id, "POST")}
                          className="rounded-full bg-ocean-blue px-3 py-1 text-xs font-semibold text-primary-navy"
                        >
                          {isFuture ? "Schedule" : "Post now"}
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
