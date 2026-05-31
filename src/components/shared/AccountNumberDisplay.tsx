"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { formatAccountNumberForDisplay } from "@/lib/bankingSerialize";
import { cn } from "@/lib/utils";

type AccountNumberDisplayProps = {
  accountNumber: string | null | undefined;
  className?: string;
  label?: string;
};

export function AccountNumberDisplay({
  accountNumber,
  className,
  label = "Copy account number",
}: AccountNumberDisplayProps) {
  const [copied, setCopied] = useState(false);
  const normalized = accountNumber?.replace(/\s/g, "") ?? "";
  const displayValue = accountNumber ? formatAccountNumberForDisplay(accountNumber) : "Pending assignment";

  async function handleCopy() {
    if (!normalized) {
      return;
    }

    try {
      await navigator.clipboard.writeText(normalized);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access may be blocked in some browsers.
    }
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="font-mono text-sm tracking-wide">{displayValue}</span>
      {normalized ? (
        <button
          type="button"
          onClick={() => void handleCopy()}
          aria-label={label}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-primary-navy/[0.10] text-primary-navy transition hover:border-ocean-blue hover:text-royal-blue dark:border-white/[0.10] dark:text-white"
        >
          {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
        </button>
      ) : null}
    </span>
  );
}
