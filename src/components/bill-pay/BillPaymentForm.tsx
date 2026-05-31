"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import { useAccounts } from "@/hooks/useAccounts";
import { useBillPay } from "@/hooks/useBillPay";
import { usePayees } from "@/hooks/usePayees";

type BillPaymentFormProps = {
  defaultSubmitForReview?: boolean;
};

export function BillPaymentForm({ defaultSubmitForReview = false }: BillPaymentFormProps) {
  const { data: accountsData } = useAccounts();
  const { payees } = usePayees();
  const { isSubmitting, error, createBillPayment } = useBillPay();
  const [fromAccountId, setFromAccountId] = useState("");
  const [payeeId, setPayeeId] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [submitForReview, setSubmitForReview] = useState(defaultSubmitForReview);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedAccount = accountsData?.accounts[0];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(null);

    const parsedAmount = Number.parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0 || !payeeId) {
      return;
    }

    const ok = await createBillPayment({
      fromAccountId: fromAccountId || selectedAccount?.id || "",
      payeeId,
      amount: parsedAmount,
      memo: memo.trim() || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
      submitForReview,
    });

    if (ok) {
      setSuccessMessage(
        submitForReview
          ? "Bill payment submitted for review."
          : "Bill payment saved as draft or scheduled.",
      );
      setAmount("");
      setMemo("");
      setDueDate("");
      setScheduledFor("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
    >
      <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Schedule payment</h2>
      <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
        Bill payments post to your ledger after operations review. Scheduled payments remain pending until approved.
      </p>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-primary-navy dark:text-white">From account</span>
          <select
            value={fromAccountId || selectedAccount?.id || ""}
            onChange={(e) => setFromAccountId(e.target.value)}
            className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
          >
            {accountsData?.accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.displayName} ({account.maskedAccountNumber}) —{" "}
                {formatCurrency(account.availableBalance)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-primary-navy dark:text-white">Payee</span>
          <select
            required
            value={payeeId}
            onChange={(e) => setPayeeId(e.target.value)}
            className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
          >
            <option value="">Select payee</option>
            {payees.map((payee) => (
              <option key={payee.id} value={payee.id}>
                {payee.nickname ?? payee.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-primary-navy dark:text-white">Amount</span>
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-primary-navy dark:text-white">Due date</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-primary-navy dark:text-white">
              Schedule for
            </span>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-primary-navy dark:text-white">Memo</span>
          <input
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
          />
        </label>

        <label className="flex items-center gap-2 text-sm font-semibold text-primary-navy dark:text-white">
          <input
            type="checkbox"
            checked={submitForReview}
            onChange={(e) => setSubmitForReview(e.target.checked)}
          />
          Submit for review immediately
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-red-700 dark:text-red-300">{error}</p> : null}
      {successMessage ? (
        <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-300">{successMessage}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy disabled:opacity-70"
      >
        <Send size={16} aria-hidden="true" />
        {isSubmitting ? "Saving..." : "Create bill payment"}
      </button>
    </form>
  );
}
