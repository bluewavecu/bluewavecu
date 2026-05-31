"use client";

import { useState } from "react";
import { AdminStatCards } from "@/components/admin/AdminStatCards";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/lib/formatCurrency";
import { useAdminBillPay } from "@/hooks/useAdminBillPay";
import { cn } from "@/lib/utils";
import type { BillPaymentStatus } from "@/types/banking";

const statusFilters: Array<BillPaymentStatus | "ALL"> = [
  "ALL",
  "PENDING_REVIEW",
  "POSTED",
  "FAILED",
  "CANCELLED",
];

export function AdminBillPayClient() {
  const [statusFilter, setStatusFilter] = useState<BillPaymentStatus | "ALL">("PENDING_REVIEW");
  const [reviewNote, setReviewNote] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, error, isLoading, isForbidden, isReviewing, refetch, reviewBillPayment } =
    useAdminBillPay(statusFilter);

  if (isLoading) {
    return <LoadingState title="Loading bill payments" message="Retrieving bill pay review queue." />;
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
        title="Bill pay queue unavailable"
        message="Bill payment records could not be loaded. Refresh the page or try again later."
      />
    );
  }

  const pending = data.billPayments.filter((p) => p.status === "PENDING_REVIEW");

  return (
    <section className="grid gap-5">
      <AdminStatCards
        items={[
          { label: "Pending review", value: data.summary.pendingReview },
          { label: "Total bill payments", value: data.summary.total },
          { label: "Displayed", value: data.billPayments.length },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setStatusFilter(filter)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold",
              statusFilter === filter
                ? "bg-ocean-blue text-primary-navy"
                : "border border-primary-navy/[0.10] bg-white dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white",
            )}
          >
            {filter === "ALL" ? "All" : filter.replaceAll("_", " ")}
          </button>
        ))}
      </div>

      {pending.length > 0 ? (
        <article className="rounded-lg border border-amber-500/[0.30] bg-amber-500/[0.06] p-5">
          <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
            Pending review
          </h2>
          <div className="mt-4 grid gap-3">
            {pending.map((payment) => (
              <div
                key={payment.id}
                className="rounded-lg border border-primary-navy/[0.08] bg-white p-4 dark:border-white/[0.08] dark:bg-white/[0.04]"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="font-semibold text-primary-navy dark:text-white">
                      {formatCurrency(payment.amount)} to {payment.payeeName}
                    </p>
                    <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                      {payment.user.fullName} | {payment.maskedAccountNumber}
                    </p>
                    {payment.riskScore !== null ? (
                      <span className="mt-2 inline-flex rounded-full bg-red-500/[0.10] px-2 py-0.5 text-xs font-semibold text-red-700 dark:text-red-300">
                        Risk {payment.riskScore}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isReviewing}
                      onClick={() => {
                        setSelectedId(payment.id);
                        void reviewBillPayment(payment.id, "APPROVE", reviewNote || undefined);
                      }}
                      className="rounded-full bg-ocean-blue px-3 py-1.5 text-xs font-semibold text-primary-navy"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={isReviewing}
                      onClick={() => void reviewBillPayment(payment.id, "FAIL", reviewNote || undefined)}
                      className="rounded-full border px-3 py-1.5 text-xs font-semibold"
                    >
                      Fail
                    </button>
                    <button
                      type="button"
                      disabled={isReviewing}
                      onClick={() => void reviewBillPayment(payment.id, "CANCEL", reviewNote || undefined)}
                      className="rounded-full border border-red-500/[0.20] px-3 py-1.5 text-xs font-semibold text-red-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                {selectedId === payment.id ? (
                  <label className="mt-3 block">
                    <span className="text-xs font-semibold">Review note</span>
                    <input
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:bg-white/[0.06]"
                    />
                  </label>
                ) : null}
              </div>
            ))}
          </div>
        </article>
      ) : null}

      <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]">
        <h2 className="text-lg font-semibold text-primary-navy dark:text-white">All bill payments</h2>
        <div className="mt-4 divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
          {data.billPayments.map((payment) => (
            <div key={payment.id} className="py-4 first:pt-0 last:pb-0">
              <p className="font-semibold text-primary-navy dark:text-white">
                {formatCurrency(payment.amount)} — {payment.payeeName}
              </p>
              <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                {payment.user.fullName} | {payment.status.replaceAll("_", " ")}
              </p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
