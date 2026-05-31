"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type TransactionPinStepProps = {
  title?: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  error?: string | null;
  isSubmitting?: boolean;
  inputClassName?: string;
};

export function TransactionPinStep({
  title = "Confirm with transaction PIN",
  description = "Enter your 6-digit PIN to authorize this payment.",
  value,
  onChange,
  onBack,
  onSubmit,
  error,
  isSubmitting = false,
  inputClassName,
}: TransactionPinStepProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue dark:text-light-blue">
          <ShieldCheck size={21} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-primary-navy dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">{description}</p>
        </div>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-primary-navy dark:text-white">
          Transaction PIN
        </span>
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          autoFocus
          required
          value={value}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
          className={cn(
            "mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-center text-lg tracking-[0.35em] text-primary-navy outline-none focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white",
            inputClassName,
          )}
        />
      </label>

      <p className="text-xs text-bluewave-gray dark:text-white/[0.48]">
        Forgot your PIN?{" "}
        <Link href="/auth/security" className="font-semibold text-royal-blue underline">
          Reset in Security
        </Link>
      </p>

      {error ? (
        <p className="rounded-lg border border-red-500/[0.20] bg-red-500/[0.08] px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-primary-navy/[0.12] bg-white px-5 text-sm font-semibold text-primary-navy transition hover:border-ocean-blue disabled:opacity-70 dark:border-white/[0.12] dark:bg-white/[0.06] dark:text-white"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back
        </button>
        <button
          type="button"
          disabled={isSubmitting || value.length !== 6}
          onClick={onSubmit}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy transition hover:bg-light-blue disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Verifying..." : "Authorize payment"}
        </button>
      </div>
    </div>
  );
}
