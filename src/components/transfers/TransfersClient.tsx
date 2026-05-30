"use client";

import { FormEvent, useState } from "react";
import {
  ArrowLeftRight,
  CalendarClock,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Send,
  XCircle,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/data/mockBanking";
import { useAccounts } from "@/hooks/useAccounts";
import { useScheduledTransfers } from "@/hooks/useScheduledTransfers";
import { useTransfer } from "@/hooks/useTransfer";
import { cn } from "@/lib/utils";
import type { ScheduledTransferRecord } from "@/types/banking";

type TransferTab = "immediate" | "scheduled";

function formatScheduleDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function ScheduledTransferRow({
  transfer,
  onUpdate,
  isSubmitting,
}: {
  transfer: ScheduledTransferRecord;
  onUpdate: (id: string, status: "ACTIVE" | "PAUSED" | "CANCELLED") => Promise<void>;
  isSubmitting: boolean;
}) {
  return (
    <div className="rounded-lg border border-primary-navy/[0.08] bg-[#f7fbff] p-4 dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-primary-navy dark:text-white">
            {formatCurrency(transfer.amount)} to {transfer.recipientName ?? transfer.destinationAccountNumber}
          </p>
          <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
            {transfer.frequency.replace("_", " ").toLowerCase()} | Next run{" "}
            {formatScheduleDate(transfer.nextRunAt)}
          </p>
          <p className="mt-1 text-xs text-bluewave-gray dark:text-white/[0.48]">
            From {transfer.maskedAccountNumber} | Status {transfer.status.toLowerCase()}
          </p>
        </div>
        {transfer.status === "ACTIVE" || transfer.status === "PAUSED" ? (
          <div className="flex flex-wrap gap-2">
            {transfer.status === "ACTIVE" ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void onUpdate(transfer.id, "PAUSED")}
                className="inline-flex h-9 items-center gap-1 rounded-full border border-primary-navy/[0.10] px-3 text-xs font-semibold text-primary-navy dark:border-white/[0.10] dark:text-white"
              >
                <PauseCircle size={14} aria-hidden="true" />
                Pause
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void onUpdate(transfer.id, "ACTIVE")}
                className="inline-flex h-9 items-center gap-1 rounded-full border border-primary-navy/[0.10] px-3 text-xs font-semibold text-primary-navy dark:border-white/[0.10] dark:text-white"
              >
                <PlayCircle size={14} aria-hidden="true" />
                Resume
              </button>
            )}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void onUpdate(transfer.id, "CANCELLED")}
              className="inline-flex h-9 items-center gap-1 rounded-full border border-red-500/[0.20] px-3 text-xs font-semibold text-red-700 dark:text-red-300"
            >
              <XCircle size={14} aria-hidden="true" />
              Cancel
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function TransfersClient() {
  const [activeTab, setActiveTab] = useState<TransferTab>("immediate");
  const { data: accountsData, error: accountsError, isLoading: accountsLoading, refetch } =
    useAccounts();
  const { isSubmitting, error, successMessage, submitTransfer, reset } = useTransfer();
  const {
    scheduledTransfers,
    error: scheduledError,
    isLoading: scheduledLoading,
    isSubmitting: scheduledSubmitting,
    createScheduledTransfer,
    updateScheduledTransfer,
  } = useScheduledTransfers();

  const [fromAccountId, setFromAccountId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [scheduledSuccess, setScheduledSuccess] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<ScheduledTransferRecord["frequency"]>("ONE_TIME");
  const [scheduledFor, setScheduledFor] = useState("");

  if (accountsLoading) {
    return (
      <LoadingState title="Loading transfer accounts" message="Retrieving authenticated accounts." />
    );
  }

  if (accountsError) {
    return <ApiErrorState message={accountsError} onRetry={refetch} />;
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

  async function handleScheduledSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setScheduledSuccess(null);

    const parsedAmount = Number.parseFloat(amount);

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0 || !scheduledFor) {
      return;
    }

    const success = await createScheduledTransfer({
      fromAccountId: fromAccountId || selectedAccount.id,
      recipientName: recipientName.trim() || undefined,
      destinationAccountNumber: toAccountNumber.trim() || undefined,
      amount: parsedAmount,
      memo: memo.trim() || undefined,
      frequency,
      scheduledFor: new Date(scheduledFor).toISOString(),
    });

    if (success) {
      setScheduledSuccess("Scheduled transfer saved successfully.");
      setRecipientName("");
      setToAccountNumber("");
      setAmount("");
      setMemo("");
      setScheduledFor("");
    }
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {[
          { id: "immediate" as const, label: "Immediate Transfer" },
          { id: "scheduled" as const, label: "Scheduled Transfers" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              activeTab === tab.id
                ? "bg-ocean-blue text-primary-navy"
                : "border border-primary-navy/[0.10] bg-white text-primary-navy dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "immediate" ? (
        <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue dark:text-light-blue">
                <Send size={21} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
                  New transfer
                </h2>
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
                    <p className="font-semibold text-primary-navy dark:text-white">
                      {successMessage}
                    </p>
                    <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                      Your transfer request has been submitted and is pending review. Account
                      balances remain unchanged.
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
                <span className="text-sm font-semibold text-primary-navy dark:text-white">
                  Amount
                </span>
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
            <CalendarClock size={24} className="text-light-blue" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-semibold">Transfer review workflow</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/[0.68]">
              Submitted transfers are stored as pending transactions for admin review. Balances are
              not updated until approval posts ledger entries.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue dark:text-light-blue">
                <CalendarClock size={21} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
                  Schedule a transfer
                </h2>
                <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">
                  Scheduled transfers create future review requests and still require approval
                  before posting.
                </p>
              </div>
            </div>

            {scheduledSuccess ? (
              <p className="mt-4 rounded-lg border border-ocean-blue/[0.20] bg-ocean-blue/[0.08] px-4 py-3 text-sm font-medium text-primary-navy dark:text-white">
                {scheduledSuccess}
              </p>
            ) : null}

            <form className="mt-6 space-y-4" onSubmit={handleScheduledSubmit}>
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
                      {account.displayName} ({account.maskedAccountNumber})
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
                  className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm text-primary-navy outline-none dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
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
                  className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm text-primary-navy outline-none dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-primary-navy dark:text-white">
                    Amount
                  </span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm text-primary-navy outline-none dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-primary-navy dark:text-white">
                    Frequency
                  </span>
                  <select
                    value={frequency}
                    onChange={(event) =>
                      setFrequency(event.target.value as ScheduledTransferRecord["frequency"])
                    }
                    className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm text-primary-navy outline-none dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
                  >
                    <option value="ONE_TIME">One time</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="BIWEEKLY">Biweekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-primary-navy dark:text-white">
                  Scheduled for
                </span>
                <input
                  type="datetime-local"
                  required
                  value={scheduledFor}
                  onChange={(event) => setScheduledFor(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm text-primary-navy outline-none dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-primary-navy dark:text-white">Memo</span>
                <input
                  type="text"
                  value={memo}
                  onChange={(event) => setMemo(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm text-primary-navy outline-none dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
                />
              </label>

              {scheduledError ? (
                <p className="rounded-lg border border-red-500/[0.20] bg-red-500/[0.08] px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
                  {scheduledError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={scheduledSubmitting}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy transition hover:bg-light-blue disabled:cursor-not-allowed disabled:opacity-70"
              >
                {scheduledSubmitting ? "Saving..." : "Create Scheduled Transfer"}
              </button>
            </form>
          </div>

          <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
            <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
              Scheduled transfers
            </h2>
            {scheduledLoading ? (
              <p className="mt-4 text-sm text-bluewave-gray dark:text-white/[0.58]">Loading...</p>
            ) : scheduledTransfers.length > 0 ? (
              <div className="mt-4 grid gap-3">
                {scheduledTransfers.map((transfer) => (
                  <ScheduledTransferRow
                    key={transfer.id}
                    transfer={transfer}
                    isSubmitting={scheduledSubmitting}
                    onUpdate={async (id, status) => {
                      await updateScheduledTransfer(id, status);
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-bluewave-gray dark:text-white/[0.58]">
                No scheduled transfers yet.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
