import type { TransactionStatus, TransactionType } from "@/types/banking";

export function isTransactionInflow(type: TransactionType, amount: number) {
  if (type === "DEPOSIT" || type === "REFUND") {
    return true;
  }

  return amount > 0;
}

export function getTransactionTitle(params: {
  merchant?: string | null;
  description: string;
}) {
  return params.merchant?.trim() || params.description;
}

export function getTransactionStatusLabel(
  status: TransactionStatus,
  type?: TransactionType,
) {
  if (status === "PENDING" && type === "TRANSFER") {
    return "Pending Review";
  }

  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getTransactionAmountClass(amount: number, className?: string) {
  const tone =
    amount > 0
      ? "text-emerald-700 dark:text-emerald-300"
      : amount < 0
        ? "text-red-700 dark:text-red-300"
        : "text-bluewave-gray dark:text-white/[0.62]";

  return className ? `${tone} ${className}` : tone;
}

export function getTransactionStatusBadgeClass(
  status: TransactionStatus,
  amount: number,
) {
  if (status === "COMPLETED") {
    return amount >= 0
      ? "bg-emerald-500/[0.12] text-emerald-700 dark:text-emerald-300"
      : "bg-red-500/[0.12] text-red-700 dark:text-red-300";
  }

  if (status === "PENDING") {
    return "bg-amber-500/[0.12] text-amber-700 dark:text-amber-300";
  }

  if (status === "FAILED" || status === "REVERSED") {
    return "bg-red-500/[0.12] text-red-700 dark:text-red-300";
  }

  return "bg-primary-navy/[0.06] text-primary-navy dark:bg-white/[0.08] dark:text-white";
}

export function getTransactionIconKind(type: TransactionType, amount: number) {
  if (type === "TRANSFER") {
    return "transfer" as const;
  }

  return isTransactionInflow(type, amount) ? ("credit" as const) : ("debit" as const);
}

export function getActivityTimelineTitle(params: {
  description: string;
  merchant?: string | null;
  type?: TransactionType;
  status?: TransactionStatus;
}) {
  const title = getTransactionTitle({
    merchant: params.merchant,
    description: params.description,
  });

  if (title) {
    return title;
  }

  if (params.type === "TRANSFER" && params.status === "PENDING") {
    return "Transfer pending review";
  }

  return "Account activity";
}

export function buildTransactionReceiptFilename(reference: string) {
  const safeReference = reference.replace(/[^a-zA-Z0-9-_]+/g, "-");
  return `bluewave-receipt-${safeReference}.pdf`;
}
