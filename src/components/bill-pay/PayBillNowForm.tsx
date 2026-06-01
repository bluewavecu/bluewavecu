"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Send, UserPlus } from "lucide-react";
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

type BillPayWizardStep = "details" | "pin" | "processing";

const fieldClassName =
  "mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm text-primary-navy outline-none focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white";

export function PayBillNowForm() {
  const { data: accountsData } = useAccounts();
  const { payees, createPayee } = usePayees();
  const { billPayPaused, isSubmitting, error, createBillPayment } = useBillPay();
  const { hasTransactionPin, isLoadingRequirements } = useTransfer();

  const [fromAccountId, setFromAccountId] = useState("");
  const [payeeId, setPayeeId] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [transactionPin, setTransactionPin] = useState("");
  const [wizardStep, setWizardStep] = useState<BillPayWizardStep>("details");
  const [processingComplete, setProcessingComplete] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [completedTransactionId, setCompletedTransactionId] = useState<string | null>(null);
  const [completedMessage, setCompletedMessage] = useState("");

  const [showAddPayee, setShowAddPayee] = useState(false);
  const [newPayeeName, setNewPayeeName] = useState("");
  const [newPayeeNickname, setNewPayeeNickname] = useState("");
  const [isAddingPayee, setIsAddingPayee] = useState(false);

  const selectedAccount = accountsData?.accounts[0];

  function resetFlow() {
    setFromAccountId("");
    setPayeeId("");
    setAmount("");
    setMemo("");
    setTransactionPin("");
    setWizardStep("details");
    setProcessingComplete(false);
    setProcessingError(null);
    setCompletedTransactionId(null);
    setCompletedMessage("");
    setShowAddPayee(false);
    setNewPayeeName("");
    setNewPayeeNickname("");
  }

  async function handleAddPayee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newPayeeName.trim()) {
      return;
    }

    setIsAddingPayee(true);
    const createdPayee = await createPayee({
      name: newPayeeName.trim(),
      nickname: newPayeeNickname.trim() || undefined,
    });
    setIsAddingPayee(false);

    if (createdPayee) {
      setPayeeId(createdPayee.id);
      setShowAddPayee(false);
      setNewPayeeName("");
      setNewPayeeNickname("");
    }
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
      postImmediately: true,
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
      <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Pay a bill</h2>

      {wizardStep === "processing" ? (
        <div className="mt-6">
          <PaymentFlowProgress
            isActive
            isComplete={processingComplete}
            error={processingError}
            successTitle="Payment successful"
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
            title="Confirm payment"
            description="Enter your 6-digit PIN to pay this bill."
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
              Set a transaction PIN before paying bills.{" "}
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

            <div className="block">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-primary-navy dark:text-white">Payee</span>
                <button
                  type="button"
                  onClick={() => setShowAddPayee((value) => !value)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-royal-blue hover:text-ocean-blue"
                >
                  <UserPlus size={15} aria-hidden="true" />
                  {showAddPayee ? "Use saved payee" : "Add new payee"}
                </button>
              </div>

              {showAddPayee ? (
                <div className="mt-3 space-y-3 rounded-lg border border-primary-navy/[0.08] bg-[#f7fbff] p-4 dark:border-white/[0.08] dark:bg-white/[0.04]">
                  <label className="block">
                    <span className="text-sm font-semibold text-primary-navy dark:text-white">Name</span>
                    <input
                      required
                      value={newPayeeName}
                      onChange={(event) => setNewPayeeName(event.target.value)}
                      className={fieldClassName}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-primary-navy dark:text-white">
                      Nickname (optional)
                    </span>
                    <input
                      value={newPayeeNickname}
                      onChange={(event) => setNewPayeeNickname(event.target.value)}
                      className={fieldClassName}
                    />
                  </label>
                  <button
                    type="button"
                    disabled={isAddingPayee}
                    onClick={(event) => void handleAddPayee(event as unknown as FormEvent<HTMLFormElement>)}
                    className="inline-flex h-10 items-center rounded-full bg-ocean-blue px-4 text-sm font-semibold text-primary-navy disabled:opacity-70"
                  >
                    {isAddingPayee ? "Saving..." : "Save payee"}
                  </button>
                </div>
              ) : (
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
              )}
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-primary-navy dark:text-white">Amount</span>
              <AmountInput required value={amount} onChange={setAmount} className={fieldClassName} />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-primary-navy dark:text-white">Memo</span>
              <input value={memo} onChange={(event) => setMemo(event.target.value)} className={fieldClassName} />
            </label>

            <button
              type="submit"
              disabled={
                billPayPaused ||
                isLoadingRequirements ||
                !hasTransactionPin ||
                (showAddPayee && !payeeId)
              }
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
