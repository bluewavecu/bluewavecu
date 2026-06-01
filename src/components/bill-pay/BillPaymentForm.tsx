"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { PaymentFlowProgress } from "@/components/payments/PaymentFlowProgress";
import { TransactionPinStep } from "@/components/payments/TransactionPinStep";
import { AmountInput } from "@/components/ui/AmountInput";
import { InfoPanel } from "@/components/ui/InfoPanel";
import { formatCurrency } from "@/lib/formatCurrency";
import { parseAmountInput } from "@/lib/amountInput";
import { useAccounts } from "@/hooks/useAccounts";
import { useBillPay } from "@/hooks/useBillPay";
import { usePayees } from "@/hooks/usePayees";
import { useTransfer } from "@/hooks/useTransfer";

type BillPaymentFormProps = {
  defaultSubmitForReview?: boolean;
};

type BillPayWizardStep = "details" | "pin" | "processing";

const fieldClassName =
  "mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm text-primary-navy outline-none focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white";

export function BillPaymentForm({ defaultSubmitForReview = false }: BillPaymentFormProps) {
  const { data: accountsData } = useAccounts();
  const { payees } = usePayees();
  const { billPayPaused, isSubmitting, error, createBillPayment } = useBillPay();
  const { hasTransactionPin, isLoadingRequirements } = useTransfer();
  const [fromAccountId, setFromAccountId] = useState("");
  const [payeeId, setPayeeId] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [submitForReview, setSubmitForReview] = useState(defaultSubmitForReview);
  const [transactionPin, setTransactionPin] = useState("");
  const [wizardStep, setWizardStep] = useState<BillPayWizardStep>("details");
  const [processingComplete, setProcessingComplete] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [completedTransactionId, setCompletedTransactionId] = useState<string | null>(null);
  const [completedMessage, setCompletedMessage] = useState("");

  const selectedAccount = accountsData?.accounts[0];

  function resetFlow() {
    setFromAccountId("");
    setPayeeId("");
    setAmount("");
    setMemo("");
    setDueDate("");
    setScheduledFor("");
    setTransactionPin("");
    setWizardStep("details");
    setProcessingComplete(false);
    setProcessingError(null);
    setCompletedTransactionId(null);
    setCompletedMessage("");
  }

  function handleDetailsContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (billPayPaused) {
      return;
    }

    const parsedAmount = parseAmountInput(amount);
    if (parsedAmount === null || !payeeId) {
      return;
    }

    setProcessingError(null);
    setWizardStep("pin");
  }

  async function handlePinAuthorize() {
    if (billPayPaused) {
      return;
    }

    const parsedAmount = parseAmountInput(amount);
    if (parsedAmount === null || !payeeId || transactionPin.trim().length !== 6) {
      return;
    }

    setWizardStep("processing");
    setProcessingComplete(false);
    setProcessingError(null);

    const result = await createBillPayment({
      fromAccountId: fromAccountId || selectedAccount?.id || "",
      payeeId,
      amount: parsedAmount,
      memo: memo.trim() || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
      submitForReview,
      transactionPin: transactionPin.trim(),
    });

    if (!result.ok) {
      setProcessingError(result.error);
      return;
    }

    setCompletedTransactionId(result.data.billPayment.transactionId);
    setCompletedMessage(result.data.message);
    setProcessingComplete(true);
  }

  return (
    <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
      <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Schedule payment</h2>
      <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
        Choose a payee and schedule a future payment.
      </p>

      {wizardStep === "processing" ? (
        <div className="mt-6">
          <PaymentFlowProgress
            isActive
            isComplete={processingComplete}
            error={processingError}
            successTitle="Bill payment successful"
            successMessage={completedMessage}
            receiptTransactionId={completedTransactionId}
            onDone={resetFlow}
            onRetry={() => {
              setProcessingError(null);
              setProcessingComplete(false);
              setWizardStep("pin");
            }}
          />
        </div>
      ) : wizardStep === "pin" ? (
        <div className="mt-6">
          <TransactionPinStep
            title="Confirm bill payment"
            description="Enter your 6-digit PIN to authorize this bill payment."
            value={transactionPin}
            onChange={setTransactionPin}
            onBack={() => setWizardStep("details")}
            onSubmit={() => void handlePinAuthorize()}
            error={error ?? processingError}
            isSubmitting={isSubmitting}
            inputClassName={fieldClassName}
          />
        </div>
      ) : (
        <>
          {!isLoadingRequirements && !hasTransactionPin ? (
            <InfoPanel title="Transaction PIN required" variant="warning" className="mt-5">
              Set a 6-digit transaction PIN before scheduling bill payments.{" "}
              <Link href="/auth/security" className="font-semibold text-royal-blue underline">
                Set up in Security
              </Link>
            </InfoPanel>
          ) : null}

          <form className="mt-5 space-y-4" onSubmit={handleDetailsContinue}>
            <label className="block">
              <span className="text-sm font-semibold text-primary-navy dark:text-white">
                From account
              </span>
              <select
                value={fromAccountId || selectedAccount?.id || ""}
                onChange={(event) => setFromAccountId(event.target.value)}
                className={fieldClassName}
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
                onChange={(event) => setPayeeId(event.target.value)}
                className={fieldClassName}
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
              <AmountInput required value={amount} onChange={setAmount} className={fieldClassName} />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-primary-navy dark:text-white">
                  Due date
                </span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className={fieldClassName}
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-primary-navy dark:text-white">
                  Schedule for
                </span>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(event) => setScheduledFor(event.target.value)}
                  className={fieldClassName}
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-primary-navy dark:text-white">Memo</span>
              <input value={memo} onChange={(event) => setMemo(event.target.value)} className={fieldClassName} />
            </label>

            <label className="flex items-center gap-2 text-sm font-semibold text-primary-navy dark:text-white">
              <input
                type="checkbox"
                checked={submitForReview}
                onChange={(event) => setSubmitForReview(event.target.checked)}
              />
              Submit for review immediately
            </label>

            <button
              type="submit"
              disabled={billPayPaused || isLoadingRequirements || !hasTransactionPin}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Send size={16} aria-hidden="true" />
              Continue to PIN
            </button>
          </form>
        </>
      )}
    </div>
  );
}
