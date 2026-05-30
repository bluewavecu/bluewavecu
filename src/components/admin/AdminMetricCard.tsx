import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminMetricCardProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "warning" | "danger";
  className?: string;
};

export function AdminMetricCard({
  label,
  value,
  hint,
  tone = "default",
  className,
}: AdminMetricCardProps) {
  return (
    <article
      className={cn(
        "rounded-lg border p-4 shadow-[0_12px_40px_rgba(10,42,94,0.06)]",
        tone === "warning"
          ? "border-amber-500/[0.30] bg-amber-500/[0.06]"
          : tone === "danger"
            ? "border-red-500/[0.30] bg-red-500/[0.06]"
            : "border-primary-navy/[0.08] bg-white dark:border-white/[0.08] dark:bg-white/[0.06]",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-bluewave-gray dark:text-white/[0.48]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-primary-navy dark:text-white">{value}</p>
      {hint ? (
        <p className="mt-1 text-xs text-bluewave-gray dark:text-white/[0.58]">{hint}</p>
      ) : null}
    </article>
  );
}
