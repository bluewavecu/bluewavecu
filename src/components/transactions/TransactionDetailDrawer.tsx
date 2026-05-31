"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, Mail, Share2 } from "lucide-react";
import { AccountNumberDisplay } from "@/components/shared/AccountNumberDisplay";
import { Amount } from "@/components/ui/Amount";
import { DateTime } from "@/components/ui/DateTime";
import { DetailDrawer } from "@/components/ui/DetailDrawer";
import { postJson } from "@/lib/clientApi";
import { buildTransactionReceiptFilename } from "@/lib/transactionDisplay";
import {
  getTransactionStatusBadgeClass,
  getTransactionStatusLabel,
} from "@/lib/transactionDisplay";
import { cn } from "@/lib/utils";
import type { TransactionStatus, TransactionType } from "@/types/banking";

export type TransactionDrawerItem = {
  id: string;
  amount: number;
  description: string;
  merchant: string | null;
  reference: string;
  status: TransactionStatus;
  type: TransactionType;
  maskedAccountNumber: string;
  createdAt: string;
  postedAt?: string | null;
  reviewedAt?: string | null;
};

type TransactionDetailDrawerProps = {
  transaction: TransactionDrawerItem | null;
  onClose: () => void;
};

function getDisplayDate(transaction: TransactionDrawerItem) {
  return transaction.postedAt ?? transaction.createdAt;
}

export function TransactionDetailDrawer({ transaction, onClose }: TransactionDetailDrawerProps) {
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isEmailingReceipt, setIsEmailingReceipt] = useState(false);
  const [isSharingReceipt, setIsSharingReceipt] = useState(false);

  async function handleEmailReceipt(transactionId: string) {
    setActionMessage(null);
    setIsEmailingReceipt(true);

    const result = await postJson<{ message: string }>(
      `/api/transactions/${transactionId}/receipt/email`,
      {},
    );

    setIsEmailingReceipt(false);

    if (!result.success) {
      setActionMessage(result.error);
      return;
    }

    setActionMessage(result.data.message);
  }

  async function handleShareReceipt(item: TransactionDrawerItem) {
    setActionMessage(null);
    setIsSharingReceipt(true);

    try {
      const response = await fetch(`/api/transactions/${item.id}/receipt`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Unable to generate receipt.");
      }

      const blob = await response.blob();
      const filename = buildTransactionReceiptFilename(item.reference);
      const file = new File([blob], filename, { type: "application/pdf" });
      const shareTitle = `Transaction ${item.reference}`;
      const shareText = `Bluewave receipt for ${item.merchant ?? item.description}`;

      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        const sharePayload = { files: [file], title: shareTitle, text: shareText };

        if (!navigator.canShare || navigator.canShare(sharePayload)) {
          await navigator.share(sharePayload);
          setActionMessage("Receipt shared.");
          setIsSharingReceipt(false);
          return;
        }
      }

      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
      setActionMessage("Receipt downloaded. Open your files app to attach it in WhatsApp, email, or elsewhere.");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setIsSharingReceipt(false);
        return;
      }

      setActionMessage(error instanceof Error ? error.message : "Unable to share receipt.");
    } finally {
      setIsSharingReceipt(false);
    }
  }

  return (
    <DetailDrawer
      open={Boolean(transaction)}
      title={transaction?.merchant ?? transaction?.description ?? "Transaction"}
      subtitle={transaction?.reference}
      onClose={() => {
        onClose();
        setActionMessage(null);
      }}
      footer={
        transaction ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              disabled={isSharingReceipt}
              onClick={() => void handleShareReceipt(transaction)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-ocean-blue px-4 text-sm font-semibold text-primary-navy disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Share2 size={16} aria-hidden="true" />
              {isSharingReceipt ? "Preparing..." : "Share transaction"}
            </button>
            <a
              href={`/api/transactions/${transaction.id}/receipt`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-primary-navy/[0.10] px-4 text-sm font-semibold text-primary-navy dark:border-white/[0.10] dark:text-white"
            >
              <Download size={16} aria-hidden="true" />
              Download PDF
            </a>
            <button
              type="button"
              disabled={isEmailingReceipt}
              onClick={() => void handleEmailReceipt(transaction.id)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-primary-navy/[0.10] px-4 text-sm font-semibold text-primary-navy dark:border-white/[0.10] dark:text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Mail size={16} aria-hidden="true" />
              {isEmailingReceipt ? "Sending..." : "Email receipt"}
            </button>
            {transaction.status === "COMPLETED" ? (
              <Link
                href="/auth/disputes"
                className="inline-flex h-10 items-center rounded-full border border-primary-navy/[0.10] px-4 text-sm font-semibold text-primary-navy dark:border-white/[0.10] dark:text-white"
              >
                Dispute transaction
              </Link>
            ) : null}
          </div>
        ) : null
      }
    >
      {transaction ? (
        <>
          {actionMessage ? (
            <p className="mb-4 rounded-lg border border-ocean-blue/[0.20] bg-ocean-blue/[0.08] px-4 py-3 text-sm font-medium text-royal-blue dark:text-light-blue">
              {actionMessage}
            </p>
          ) : null}
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-bluewave-gray dark:text-white/[0.58]">Amount</dt>
              <dd>
                <Amount value={transaction.amount} />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-bluewave-gray dark:text-white/[0.58]">Status</dt>
              <dd>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                    getTransactionStatusBadgeClass(transaction.status, transaction.amount),
                  )}
                >
                  {getTransactionStatusLabel(transaction.status, transaction.type)}
                </span>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-bluewave-gray dark:text-white/[0.58]">Date</dt>
              <dd>
                <DateTime value={getDisplayDate(transaction)} variant="datetime" />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-bluewave-gray dark:text-white/[0.58]">Account</dt>
              <dd>
                <AccountNumberDisplay accountNumber={transaction.maskedAccountNumber} />
              </dd>
            </div>
            {transaction.reviewedAt ? (
              <div className="flex justify-between gap-4">
                <dt className="text-bluewave-gray dark:text-white/[0.58]">Reviewed</dt>
                <dd>
                  <DateTime value={transaction.reviewedAt} variant="datetime" />
                </dd>
              </div>
            ) : null}
          </dl>
        </>
      ) : null}
    </DetailDrawer>
  );
}
