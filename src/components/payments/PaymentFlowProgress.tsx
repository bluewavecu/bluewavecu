"use client";

import Link from "next/link";
import { CheckCircle2, Download, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type PaymentFlowProgressProps = {
  isActive: boolean;
  isComplete: boolean;
  error?: string | null;
  successTitle?: string;
  successMessage?: string;
  receiptTransactionId?: string | null;
  onDone: () => void;
  onRetry?: () => void;
};

export function PaymentFlowProgress({
  isActive,
  isComplete,
  error,
  successTitle = "Payment successful",
  successMessage = "Your request was submitted successfully.",
  receiptTransactionId,
  onDone,
  onRetry,
}: PaymentFlowProgressProps) {
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      setShowSuccess(false);
      return;
    }

    setProgress(0);
    setShowSuccess(false);

    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (isComplete) {
          return current;
        }

        if (current >= 92) {
          return current;
        }

        const step = current < 60 ? 4 : current < 85 ? 2 : 1;
        return Math.min(current + step, 92);
      });
    }, 80);

    return () => window.clearInterval(interval);
  }, [isActive, isComplete]);

  useEffect(() => {
    if (!isActive || !isComplete || error) {
      return;
    }

    setProgress(100);

    const timer = window.setTimeout(() => {
      setShowSuccess(true);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [isActive, isComplete, error]);

  if (!isActive) {
    return null;
  }

  if (error) {
    return (
      <div className="space-y-4 text-center">
        <p className="rounded-lg border border-red-500/[0.20] bg-red-500/[0.08] px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
          {error}
        </p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-11 items-center justify-center rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy"
          >
            Try again
          </button>
        ) : null}
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
          <CheckCircle2 size={44} aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-2xl font-semibold text-emerald-700 dark:text-emerald-300">
          {successTitle}
        </h2>
        <p className="mt-2 max-w-md text-sm text-bluewave-gray dark:text-white/[0.58]">
          {successMessage}
        </p>
        <div className="mt-6 flex w-full max-w-md flex-col gap-2.5 sm:flex-row">
          {receiptTransactionId ? (
            <a
              href={`/api/transactions/${receiptTransactionId}/receipt`}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy transition hover:bg-light-blue"
            >
              <Download size={16} aria-hidden="true" />
              Download receipt
            </a>
          ) : null}
          <Link
            href="/auth/dashboard"
            onClick={onDone}
            className={cn(
              "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-primary-navy/[0.12] bg-white px-5 text-sm font-semibold text-primary-navy transition hover:border-ocean-blue dark:border-white/[0.12] dark:bg-white/[0.06] dark:text-white",
              !receiptTransactionId && "sm:flex-1",
            )}
          >
            <Home size={16} aria-hidden="true" />
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-8">
      <div className="relative flex h-40 w-40 items-center justify-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-primary-navy/[0.08] dark:text-white/[0.10]"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
            className="text-ocean-blue transition-[stroke-dashoffset] duration-150 ease-out"
          />
        </svg>

        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-primary-navy/[0.10] bg-white shadow-[inset_0_8px_24px_rgba(10,42,94,0.08)] dark:border-white/[0.10] dark:bg-white/[0.06]">
          <div className="relative flex h-14 w-3 animate-spin rounded-full bg-gradient-to-b from-ocean-blue to-royal-blue shadow-[0_4px_12px_rgba(10,42,94,0.25)]" />
        </div>
      </div>

      <p className="mt-6 text-3xl font-semibold tabular-nums text-primary-navy dark:text-white">
        {progress}%
      </p>
      <p className="mt-2 text-sm text-bluewave-gray dark:text-white/[0.58]">
        Processing your payment securely...
      </p>
    </div>
  );
}
