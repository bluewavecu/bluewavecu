"use client";

import { FormEvent, useState } from "react";
import { ArrowLeftRight, CalendarDays, CheckCircle2, Send } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/data/mockBanking";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransfer } from "@/hooks/useTransfer";

export function TransfersClient() {
  const { data: accountsData, error: accountsError, isLoading: accountsLoading, refetch } =
    useAccounts();
  const { isSubmitting, error, successMessage, submitTransfer, reset } = useTransfer();
  const [fromAccountId, setFromAccountId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  if (accountsLoading) {
    return (
      <LoadingState title="Loading transfer accounts" message="Retrieving authenticated accounts." />
    );
  }

  if (accountsError) {
    return <ErrorState message={accountsError} onRetry={refetch} />;
  }

  if (!accountsData || accountsData.accounts.length === 0) {
    return (
      <EmptyState
        title="No accounts available"
        message="Add or seed accounts before creating transfer requests."
      />
    );
  }

  const selectedAccount =
    accountsData.accounts.find((account) => account.id === fromAccountId) ??
    accountsData.accounts[0];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    reset();

    const parsedAmount = Number.parseFloat(amount);

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    const success = await submitTransfer({
      fromAccountId: fromAccountId || selectedAccount.id,
      recipientName: recipientName.trim() || undefined,
      toAccountNumber: toAccountNumber.trim() || undefined,
      amount: parsedAmount,
      memo: memo.trim() || undefined,
    });

    if (success) {
      setRecipientName("");
      setToAccountNumber("");
      setAmount("");
      setMemo("");
    }
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue dark:text-light-blue">
            <Send size={21} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-primary-navy dark:text-white">New transfer</h2>
            <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">
              Creates a pending transfer request without moving real funds.
            </p>
          </div>
        </div>

        {successMessage ? (
          <div className="mt-6 rounded-lg border border-ocean-blue/[0.20] bg-ocean-blue/[0.08] p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 text-royal-blue dark:text-light-blue" size={20} />
              <div>
                <p className="font-semibold text-primary-navy dark:text-white">{successMessage}</p>
                <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                  Your request is queued for review. Account balances remain unchanged.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-primary-navy dark:text-white">
              From account
            </span>
            <select
              value={fromAccountId || selectedAccount.id}
              onChange={(event) => setFromAccountId(event.target.value)}
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm text-primary-navy outline-none focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            >
              {accountsData.accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.displayName} ({account.maskedAccountNumber}) —{" "}
                  {formatCurrency(account.availableBalance)} available
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-primary-navy dark:text-white">
              Recipient name
            </span>
            <input
              type="text"
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              placeholder="Jordan Parker"
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm text-primary-navy outline-none placeholder:text-bluewave-gray focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-primary-navy dark:text-white">
              Recipient account number
            </span>
            <input
              type="text"
              value={toAccountNumber}
              onChange={(event) => setToAccountNumber(event.target.value)}
              placeholder="1048225799"
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm text-primary-navy outline-none placeholder:text-bluewave-gray focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-primary-navy dark:text-white">Amount</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm text-primary-navy outline-none placeholder:text-bluewave-gray focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-primary-navy dark:text-white">Memo</span>
            <input
              type="text"
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              placeholder="Optional transfer note"
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm text-primary-navy outline-none placeholder:text-bluewave-gray focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-red-500/[0.20] bg-red-500/[0.08] px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy transition hover:bg-light-blue disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Submitting..." : "Submit Transfer Request"}
            <ArrowLeftRight size={17} aria-hidden="true" />
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-primary-navy/[0.08] bg-primary-navy p-6 text-white shadow-[0_18px_60px_rgba(10,42,94,0.12)]">
        <CalendarDays size={24} className="text-light-blue" aria-hidden="true" />
        <h2 className="mt-5 text-2xl font-semibold">Transfer review workflow</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/[0.68]">
          Submitted transfers are stored as pending transactions for demo review. Balances are not
          updated until a future approval workflow is implemented.
        </p>
        <div className="mt-7 grid gap-3">
          {[
            "Request submitted as pending",
            "Member review queue placeholder",
            "Balance movement disabled in demo",
          ].map((item) => (
            <div key={item} className="rounded-lg border border-white/[0.12] bg-white/[0.08] p-4">
              <p className="font-semibold">{item}</p>
              <p className="mt-1 text-sm text-white/[0.58]">Step 6 demo workflow</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
