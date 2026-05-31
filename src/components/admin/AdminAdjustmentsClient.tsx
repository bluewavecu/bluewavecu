"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminStatCards } from "@/components/admin/AdminStatCards";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/lib/formatCurrency";
import { parseAmountInput } from "@/lib/amountInput";
import { useAdminAdjustments } from "@/hooks/useAdminAdjustments";
import { AmountInput } from "@/components/ui/AmountInput";
import { cn } from "@/lib/utils";
import type { AdjustmentStatus, AdminAccountRecord, AdminUserSummaryWithKyc } from "@/types/banking";

const filters: Array<AdjustmentStatus | "ALL"> = ["ALL", "POSTED", "REJECTED", "PENDING", "APPROVED"];

const fieldClassName =
  "mt-1.5 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-3 py-2.5 text-sm text-primary-navy outline-none focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white";

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
  const searchParams = useSearchParams();
  const preselectedUserId = searchParams.get("userId") ?? "";
  const [statusFilter, setStatusFilter] = useState<AdjustmentStatus | "ALL">("POSTED");
  const [users, setUsers] = useState<AdminUserSummaryWithKyc[]>([]);
  const [accounts, setAccounts] = useState<AdminAccountRecord[]>([]);
  const [userId, setUserId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<"DEBIT" | "CREDIT">("CREDIT");
  const [reason, setReason] = useState("");
  const { data, error, isLoading, isForbidden, isSubmitting, refetch, createAdjustment } =
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

  useEffect(() => {
    if (!preselectedUserId || users.length === 0 || accounts.length === 0) {
      return;
    }

    if (!users.some((user) => user.id === preselectedUserId)) {
      return;
    }

    setUserId(preselectedUserId);

    const memberAccounts = accounts.filter((account) => account.user.id === preselectedUserId);

    if (memberAccounts.length === 1) {
      setAccountId(memberAccounts[0]!.id);
    }
  }, [accounts, preselectedUserId, users]);

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
    return <LoadingState title="Loading adjustments" message="Retrieving credit and debit history." />;
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

  const postedCount = data.adjustments.filter((item) => item.status === "POSTED").length;

  return (
    <section className="grid gap-5">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const parsedAmount = parseAmountInput(amount);

          if (parsedAmount === null) {
            return;
          }

          void createAdjustment({
            accountId,
            amount: parsedAmount,
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
        <h2 className="text-lg font-semibold">Credit or debit member account</h2>
        <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
          Adjustments post immediately to the member balance and transaction history.
        </p>
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
            <AmountInput
              required
              value={amount}
              onChange={setAmount}
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
          {isSubmitting ? "Applying..." : "Apply adjustment"}
        </button>
      </form>

      <AdminStatCards
        items={[
          { label: "Posted (this view)", value: postedCount },
          { label: "Pending", value: data.summary.pending },
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
              <th className="px-4 py-3 font-semibold">Posted</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
            {data.adjustments.map((adjustment) => (
              <tr key={adjustment.id}>
                <td className="px-4 py-3 font-semibold">{adjustment.userName}</td>
                <td className="px-4 py-3">{adjustment.direction}</td>
                <td className="px-4 py-3">{formatCurrency(adjustment.amount)}</td>
                <td className="max-w-xs px-4 py-3 text-bluewave-gray dark:text-white/[0.62]">
                  {adjustment.reason}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatEffectiveAt(adjustment.postedAt ?? adjustment.effectiveAt)}
                </td>
                <td className="px-4 py-3">{adjustment.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
