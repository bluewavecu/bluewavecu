"use client";

import Link from "next/link";
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
import { InfoPanel } from "@/components/ui/InfoPanel";
import { LoadingState } from "@/components/ui/LoadingState";
import { AmountInput } from "@/components/ui/AmountInput";
import { formatCurrency } from "@/lib/formatCurrency";
import { parseAmountInput } from "@/lib/amountInput";
import { useAccounts } from "@/hooks/useAccounts";
import { useMemberSummary } from "@/hooks/useMemberSummary";
import { useScheduledTransfers } from "@/hooks/useScheduledTransfers";
import { useTransfer } from "@/hooks/useTransfer";
import { cn } from "@/lib/utils";
import {
  isInternationalWireMethod,
  isDomesticWireMethod,
  TRANSFER_METHOD_OPTIONS,
  type TransferMethod,
} from "@/data/transferMethods";
import type { ScheduledTransferRecord, TransferRequestInput } from "@/types/banking";

type TransferTab = "transfer" | "scheduled";

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

const inputClassName =
  "mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm text-primary-navy outline-none placeholder:text-bluewave-gray focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white";

export function TransfersClient() {
  const [activeTab, setActiveTab] = useState<TransferTab>("transfer");
  const [transferMethod, setTransferMethod] = useState<TransferMethod>("DIRECT_DEPOSIT");
  const { data: accountsData, error: accountsError, isLoading: accountsLoading, refetch } =
    useAccounts();
  const {
    isSubmitting,
    isLoadingRequirements,
    error,
    successMessage,
    hasTransactionPin,
    adminSteps,
    adminStepsRequired,
    submitTransfer,
    reset,
  } = useTransfer();
  const {
    scheduledTransfers,
    error: scheduledError,
    isLoading: scheduledLoading,
    isSubmitting: scheduledSubmitting,
    createScheduledTransfer,
    updateScheduledTransfer,
  } = useScheduledTransfers();
  const { summary } = useMemberSummary();

  const [fromAccountId, setFromAccountId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [beneficiaryBankName, setBeneficiaryBankName] = useState("");
  const [bankCountry, setBankCountry] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [stepOtpCodes, setStepOtpCodes] = useState<Record<string, string>>({});
  const [transactionPin, setTransactionPin] = useState("");
  const [scheduledSuccess, setScheduledSuccess] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<ScheduledTransferRecord["frequency"]>("ONE_TIME");
  const [scheduledFor, setScheduledFor] = useState("");

  if (accountsLoading) {
    return (
      <LoadingState title="Loading transfer accounts" message="Retrieving your accounts." />
    );
  }

  if (accountsError) {
    return <ApiErrorState message={accountsError} onRetry={refetch} />;
  }

  if (!accountsData || accountsData.accounts.length === 0) {
    return (
      <EmptyState
        title="No accounts available"
        message="Contact member services to open a checking or savings account before initiating transfers."
      />
    );
  }

  const selectedAccount =
    accountsData.accounts.find((account) => account.id === fromAccountId) ??
    accountsData.accounts[0];

  function clearTransferFormFields() {
    setRecipientName("");
    setToAccountNumber("");
    setReceiverAddress("");
    setSwiftCode("");
    setBeneficiaryBankName("");
    setBankCountry("");
    setAmount("");
    setMemo("");
    setStepOtpCodes({});
    setTransactionPin("");
    reset();
  }

  function handleTransferMethodChange(method: TransferMethod) {
    setTransferMethod(method);
    setReceiverAddress("");
    setSwiftCode("");
    setBeneficiaryBankName("");
    setBankCountry("");
    reset();
  }

  function buildTransferPayload(): TransferRequestInput | null {
    const parsedAmount = parseAmountInput(amount);

    if (parsedAmount === null) {
      return null;
    }

    const payload: TransferRequestInput = {
      fromAccountId: fromAccountId || selectedAccount.id,
      transferMethod,
      amount: parsedAmount,
    };

    const trimmedRecipient = recipientName.trim();
    const trimmedAccount = toAccountNumber.trim();
    const trimmedMemo = memo.trim();

    if (trimmedRecipient) {
      payload.recipientName = trimmedRecipient;
    }

    if (trimmedAccount) {
      payload.toAccountNumber = trimmedAccount;
    }

    if (trimmedMemo) {
      payload.memo = trimmedMemo;
    }

    if (isDomesticWireMethod(transferMethod) || isInternationalWireMethod(transferMethod)) {
      const trimmedAddress = receiverAddress.trim();
      if (trimmedAddress) {
        payload.receiverAddress = trimmedAddress;
      }
    }

    if (isInternationalWireMethod(transferMethod)) {
      payload.swiftCode = swiftCode.trim();
      payload.beneficiaryBankName = beneficiaryBankName.trim();
      payload.bankCountry = bankCountry.trim();
    }

    return payload;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = buildTransferPayload();

    if (!payload) {
      return;
    }

    payload.transactionPin = transactionPin.trim();

    if (adminStepsRequired && adminSteps.length > 0) {
      const codes: NonNullable<TransferRequestInput["stepOtpCodes"]> = {};

      for (const step of adminSteps) {
        const code = stepOtpCodes[step.stepKey]?.trim();
        if (code) {
          codes[step.stepKey] = code;
        }
      }

      if (Object.keys(codes).length > 0) {
        payload.stepOtpCodes = codes;
      }
    }

    const success = await submitTransfer(payload);

    if (success) {
      clearTransferFormFields();
    }
  }

  async function handleScheduledSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setScheduledSuccess(null);

    const parsedAmount = parseAmountInput(amount);

    if (parsedAmount === null || !scheduledFor) {
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

  const accountLabel = isInternationalWireMethod(transferMethod)
    ? "IBAN or account number"
    : "Recipient account number";

  return (
    <section className="grid gap-5">
      {summary?.needsProfileCompletion ? (
        <InfoPanel title="Profile verification recommended" variant="warning">
          Your profile is not fully verified. High-value transfers may receive additional review.{" "}
          <Link href="/auth/profile" className="font-semibold text-royal-blue underline">
            Complete profile & verification
          </Link>
        </InfoPanel>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {[
          { id: "transfer" as const, label: "Transfer" },
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

      {activeTab === "transfer" ? (
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
                      Your transfer request has been submitted. Account balances update once the
                      transfer is approved and posted.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {!isLoadingRequirements && !hasTransactionPin ? (
              <InfoPanel title="Transaction PIN required" variant="warning" className="mt-6">
                Set a 6-digit transaction PIN before sending transfers.{" "}
                <Link href="/auth/security" className="font-semibold text-royal-blue underline">
                  Set up in Security
                </Link>
              </InfoPanel>
            ) : null}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-sm font-semibold text-primary-navy dark:text-white">
                  From account
                </span>
                <select
                  value={fromAccountId || selectedAccount.id}
                  onChange={(event) => setFromAccountId(event.target.value)}
                  className={inputClassName}
                >
                  {accountsData.accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.displayName} ({account.maskedAccountNumber}) —{" "}
                      {formatCurrency(account.availableBalance)} available
                    </option>
                  ))}
                </select>
              </label>

              <fieldset className="block">
                <legend className="text-sm font-semibold text-primary-navy dark:text-white">
                  Transfer method
                </legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {TRANSFER_METHOD_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium transition",
                        transferMethod === option.value
                          ? "border-ocean-blue bg-ocean-blue/[0.08] text-primary-navy dark:text-white"
                          : "border-primary-navy/[0.10] bg-[#f7fbff] text-primary-navy dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white",
                      )}
                    >
                      <input
                        type="radio"
                        name="transferMethod"
                        value={option.value}
                        checked={transferMethod === option.value}
                        onChange={() => handleTransferMethodChange(option.value)}
                        className="h-4 w-4 accent-ocean-blue"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="block">
                <span className="text-sm font-semibold text-primary-navy dark:text-white">
                  {isInternationalWireMethod(transferMethod) ? "Beneficiary name" : "Recipient name"}
                </span>
                <input
                  type="text"
                  required={isInternationalWireMethod(transferMethod)}
                  value={recipientName}
                  onChange={(event) => setRecipientName(event.target.value)}
                  className={inputClassName}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-primary-navy dark:text-white">
                  {accountLabel}
                </span>
                <input
                  type="text"
                  required={isInternationalWireMethod(transferMethod)}
                  value={toAccountNumber}
                  onChange={(event) => setToAccountNumber(event.target.value)}
                  className={inputClassName}
                />
              </label>

              {isInternationalWireMethod(transferMethod) ? (
                <>
                  <label className="block">
                    <span className="text-sm font-semibold text-primary-navy dark:text-white">
                      SWIFT / BIC
                    </span>
                    <input
                      type="text"
                      required
                      value={swiftCode}
                      onChange={(event) => setSwiftCode(event.target.value.toUpperCase())}
                      className={inputClassName}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-primary-navy dark:text-white">
                      Beneficiary bank
                    </span>
                    <input
                      type="text"
                      required
                      value={beneficiaryBankName}
                      onChange={(event) => setBeneficiaryBankName(event.target.value)}
                      className={inputClassName}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-primary-navy dark:text-white">
                      Bank country
                    </span>
                    <input
                      type="text"
                      required
                      value={bankCountry}
                      onChange={(event) => setBankCountry(event.target.value)}
                      placeholder="Country"
                      className={inputClassName}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-primary-navy dark:text-white">
                      Beneficiary address
                    </span>
                    <input
                      type="text"
                      required
                      value={receiverAddress}
                      onChange={(event) => setReceiverAddress(event.target.value)}
                      className={inputClassName}
                    />
                  </label>
                </>
              ) : null}

              {isDomesticWireMethod(transferMethod) ? (
                <label className="block">
                  <span className="text-sm font-semibold text-primary-navy dark:text-white">
                    Receiver address
                  </span>
                  <input
                    type="text"
                    required
                    value={receiverAddress}
                    onChange={(event) => setReceiverAddress(event.target.value)}
                    className={inputClassName}
                  />
                </label>
              ) : null}

              <label className="block">
                <span className="text-sm font-semibold text-primary-navy dark:text-white">
                  Amount
                </span>
                <AmountInput required value={amount} onChange={setAmount} className={inputClassName} />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-primary-navy dark:text-white">Memo</span>
                <input
                  type="text"
                  value={memo}
                  onChange={(event) => setMemo(event.target.value)}
                  placeholder="Optional"
                  className={inputClassName}
                />
              </label>

              {adminSteps.map((step) => (
                <label key={step.stepKey} className="block">
                  <span className="text-sm font-semibold text-primary-navy dark:text-white">
                    {step.label}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    value={stepOtpCodes[step.stepKey] ?? ""}
                    onChange={(event) =>
                      setStepOtpCodes((current) => ({
                        ...current,
                        [step.stepKey]: event.target.value.replace(/\D/g, "").slice(0, 6),
                      }))
                    }
                    className={inputClassName}
                  />
                </label>
              ))}

              {hasTransactionPin ? (
                <label className="block">
                  <span className="text-sm font-semibold text-primary-navy dark:text-white">
                    Transaction PIN
                  </span>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    value={transactionPin}
                    onChange={(event) =>
                      setTransactionPin(event.target.value.replace(/\D/g, ""))
                    }
                    className={inputClassName}
                  />
                </label>
              ) : null}

              {error ? (
                <p className="rounded-lg border border-red-500/[0.20] bg-red-500/[0.08] px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting || isLoadingRequirements || !hasTransactionPin}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy transition hover:bg-light-blue disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Submitting..." : "Submit transfer"}
                <ArrowLeftRight size={17} aria-hidden="true" />
              </button>
            </form>
          </div>

          <div className="rounded-lg border border-primary-navy/[0.08] bg-primary-navy p-6 text-white shadow-[0_18px_60px_rgba(10,42,94,0.12)]">
            <CalendarClock size={24} className="text-light-blue" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-semibold">Transfer review</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/[0.68]">
              Transfers are authorized with your transaction PIN. Pending transfers are reviewed by
              member services before posting.
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
                  className={inputClassName}
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
                  className={inputClassName}
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
                  className={inputClassName}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-primary-navy dark:text-white">
                    Amount
                  </span>
                  <AmountInput
                    required
                    value={amount}
                    onChange={setAmount}
                    className={inputClassName}
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
                    className={inputClassName}
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
                  className={inputClassName}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-primary-navy dark:text-white">Memo</span>
                <input
                  type="text"
                  value={memo}
                  onChange={(event) => setMemo(event.target.value)}
                  className={inputClassName}
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
