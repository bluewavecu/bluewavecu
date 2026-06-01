"use client";

import { formatCurrency } from "@/lib/formatCurrency";
import { useBillPay } from "@/hooks/useBillPay";
import { cn } from "@/lib/utils";

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function statusClass(status: string) {
  if (status === "PENDING_REVIEW") {
    return "bg-amber-500/[0.12] text-amber-700 dark:text-amber-300";
  }

  if (status === "POSTED") {
    return "bg-emerald-500/[0.12] text-emerald-700 dark:text-emerald-300";
  }

  if (status === "FAILED" || status === "CANCELLED") {
    return "bg-red-500/[0.12] text-red-700 dark:text-red-300";
  }

  return "bg-ocean-blue/[0.10] text-royal-blue dark:text-light-blue";
}

export function BillPaymentList() {
  const { billPayments, billPayPaused, isLoading, isSubmitting, updateBillPayment } = useBillPay();

  if (isLoading) {
    return <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">Loading bill payments...</p>;
  }

  if (billPayments.length === 0) {
    return (
      <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">
        No bill payments yet. Create one from the Schedule Payment tab.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {billPayments.map((payment) => (
        <article
          key={payment.id}
          className="rounded-lg border border-primary-navy/[0.08] bg-[#f7fbff] p-4 dark:border-white/[0.08] dark:bg-white/[0.04]"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-semibold text-primary-navy dark:text-white">
                {formatCurrency(payment.amount)} to {payment.payeeName}
              </p>
              <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                From {payment.maskedAccountNumber} | Due {formatDate(payment.dueDate)}
              </p>
              {payment.riskScore !== null ? (
                <p className="mt-1 text-xs text-bluewave-gray dark:text-white/[0.48]">
                  Risk score {payment.riskScore}
                </p>
              ) : null}
            </div>
            <span
              className={cn(
                "inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold",
                statusClass(payment.status),
              )}
            >
              {payment.status.replaceAll("_", " ")}
            </span>
          </div>

          {(payment.status === "DRAFT" || payment.status === "SCHEDULED") && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isSubmitting || billPayPaused}
                onClick={() => void updateBillPayment(payment.id, "submit")}
                className="rounded-full bg-ocean-blue px-3 py-1.5 text-xs font-semibold text-primary-navy"
              >
                Submit for review
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void updateBillPayment(payment.id, "cancel")}
                className="rounded-full border border-primary-navy/[0.10] px-3 py-1.5 text-xs font-semibold dark:border-white/[0.10]"
              >
                Cancel
              </button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
