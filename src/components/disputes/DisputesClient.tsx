"use client";

import { useState } from "react";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/data/mockBanking";
import { useDisputes } from "@/hooks/useDisputes";
import { useTransactions } from "@/hooks/useTransactions";
import { cn } from "@/lib/utils";
import type { DisputeStatus } from "@/types/banking";

function statusClass(status: DisputeStatus) {
  if (status === "OPEN" || status === "UNDER_REVIEW") {
    return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
  }

  if (status === "RESOLVED") {
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  }

  if (status === "REJECTED") {
    return "bg-red-500/15 text-red-700 dark:text-red-300";
  }

  return "bg-primary-navy/10 text-primary-navy dark:bg-white/10 dark:text-white";
}

export function DisputesClient() {
  const { disputes, error, isLoading, isSubmitting, createDispute, closeDispute } = useDisputes();
  const { data: transactionsData } = useTransactions();
  const [transactionId, setTransactionId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingState title="Loading disputes" message="Retrieving your dispute history." />;
  }

  if (error && disputes.length === 0) {
    return <ApiErrorState message={error} />;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSuccessMessage(null);
    const ok = await createDispute({ transactionId, reason, description });

    if (ok) {
      setTransactionId("");
      setReason("");
      setDescription("");
      setSuccessMessage("Dispute submitted successfully.");
    }
  }

  return (
    <section className="grid gap-5">
      <article className="rounded-lg border border-primary-navy/[0.08] bg-[#f7fbff] p-4 text-sm dark:border-white/[0.08] dark:bg-white/[0.04]">
        Submitting a dispute does not automatically reverse a transaction. Our team will review your
        case and follow up with a resolution.
      </article>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]"
      >
        <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Create dispute</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold">Transaction</span>
            <select
              required
              value={transactionId}
              onChange={(event) => setTransactionId(event.target.value)}
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            >
              <option value="">Select a transaction</option>
              {transactionsData?.transactions.map((tx) => (
                <option key={tx.id} value={tx.id}>
                  {tx.reference} — {formatCurrency(Math.abs(tx.amount))} — {tx.description}
                </option>
              ))}
            </select>
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-semibold">Reason</span>
            <input
              required
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-semibold">Description</span>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            />
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-red-700 dark:text-red-300">{error}</p> : null}
        {successMessage ? (
          <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-300">{successMessage}</p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 inline-flex h-11 items-center rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy disabled:opacity-70"
        >
          {isSubmitting ? "Submitting..." : "Submit dispute"}
        </button>
      </form>

      <div className="grid gap-3">
        {disputes.map((dispute) => (
          <article
            key={dispute.id}
            className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-primary-navy dark:text-white">{dispute.reason}</p>
                <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.62]">
                  {dispute.transaction?.reference} — {dispute.transaction?.description}
                </p>
              </div>
              <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", statusClass(dispute.status))}>
                {dispute.status.replaceAll("_", " ")}
              </span>
            </div>
            <p className="mt-3 text-sm">{dispute.description}</p>
            {dispute.status === "OPEN" ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void closeDispute(dispute.id)}
                className="mt-4 text-sm font-semibold text-primary-navy underline dark:text-white"
              >
                Close dispute
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
