import { cn } from "@/lib/utils";

type StatusBadgeTone = "default" | "success" | "warning" | "danger" | "info";

const toneClasses: Record<StatusBadgeTone, string> = {
  default: "bg-primary-navy/[0.06] text-primary-navy dark:bg-white/[0.08] dark:text-white",
  success: "bg-emerald-500/[0.12] text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/[0.12] text-amber-700 dark:text-amber-300",
  danger: "bg-red-500/[0.12] text-red-700 dark:text-red-300",
  info: "bg-ocean-blue/[0.10] text-royal-blue dark:text-light-blue",
};

type StatusBadgeProps = {
  label: string;
  tone?: StatusBadgeTone;
  className?: string;
};

export function StatusBadge({ label, tone = "default", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}

export function statusToTone(status: string): StatusBadgeTone {
  const normalized = status.toUpperCase();

  if (["COMPLETED", "ACTIVE", "VERIFIED", "RESOLVED", "POSTED", "APPROVED"].includes(normalized)) {
    return "success";
  }

  if (["PENDING", "SUBMITTED", "UNDER_REVIEW", "PAUSED", "PENDING_APPROVAL"].includes(normalized)) {
    return "warning";
  }

  if (["FAILED", "REVERSED", "REJECTED", "DENIED", "DECLINED", "CANCELLED", "LOCKED"].includes(normalized)) {
    return "danger";
  }

  if (["OPEN", "INFO", "SYSTEM"].includes(normalized)) {
    return "info";
  }

  return "default";
}

export function formatStatusLabel(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatNotificationTypeLabel(type: string) {
  if (type === "ADMIN") {
    return "Account update";
  }

  return formatStatusLabel(type);
}
