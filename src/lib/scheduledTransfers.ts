import type { ScheduledTransferFrequency } from "@/types/banking";

export function computeNextRunAt(frequency: ScheduledTransferFrequency, scheduledFor: Date) {
  const next = new Date(scheduledFor);

  if (frequency === "ONE_TIME") {
    return next;
  }

  const now = new Date();

  while (next <= now) {
    if (frequency === "WEEKLY") {
      next.setDate(next.getDate() + 7);
    } else if (frequency === "BIWEEKLY") {
      next.setDate(next.getDate() + 14);
    } else {
      next.setMonth(next.getMonth() + 1);
    }
  }

  return next;
}

export function maskDestinationAccountNumber(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (trimmed.length <= 4) {
    return `****${trimmed}`;
  }

  return `****${trimmed.slice(-4)}`;
}
