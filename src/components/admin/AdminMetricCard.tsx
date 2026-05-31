import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminMetricCardProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "warning" | "danger";
  className?: string;
  href?: string;
};

const toneClasses = {
  default: "border-primary-navy/[0.08] bg-white dark:border-white/[0.08] dark:bg-white/[0.06]",
  warning: "border-amber-500/[0.30] bg-amber-500/[0.06]",
  danger: "border-red-500/[0.30] bg-red-500/[0.06]",
} as const;

function AdminMetricCardContent({
  label,
  value,
  hint,
  tone = "default",
  linked = false,
}: Omit<AdminMetricCardProps, "className" | "href"> & { linked?: boolean }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-bluewave-gray dark:text-white/[0.48]">
          {label}
        </p>
        {linked ? (
          <ArrowUpRight
            size={16}
            className="shrink-0 text-royal-blue opacity-70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 dark:text-light-blue"
            aria-hidden="true"
          />
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-semibold text-primary-navy dark:text-white">{value}</p>
      {hint ? (
        <p className="mt-1 text-xs text-bluewave-gray dark:text-white/[0.58]">{hint}</p>
      ) : null}
      {linked ? (
        <p className="mt-3 text-xs font-semibold text-royal-blue dark:text-light-blue">Open queue</p>
      ) : null}
    </>
  );
}

export function AdminMetricCard({
  label,
  value,
  hint,
  tone = "default",
  className,
  href,
}: AdminMetricCardProps) {
  const cardClassName = cn(
    "rounded-lg border p-4 shadow-[0_12px_40px_rgba(10,42,94,0.06)]",
    toneClasses[tone],
    href &&
      "group transition hover:border-ocean-blue/35 hover:shadow-[0_16px_48px_rgba(0,168,232,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-blue/40",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={cn(cardClassName, "block")} aria-label={`Open ${label}`}>
        <AdminMetricCardContent label={label} value={value} hint={hint} tone={tone} linked />
      </Link>
    );
  }

  return (
    <article className={cardClassName}>
      <AdminMetricCardContent label={label} value={value} hint={hint} tone={tone} />
    </article>
  );
}

type AdminCommandPanelProps = {
  title: string;
  href: string;
  children: ReactNode;
  className?: string;
};

export function AdminCommandPanel({ title, href, children, className }: AdminCommandPanelProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group block rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] transition hover:border-ocean-blue/30 hover:shadow-[0_18px_60px_rgba(0,168,232,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-blue/40 dark:border-white/[0.08] dark:bg-white/[0.06]",
        className,
      )}
      aria-label={`Open ${title}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-primary-navy dark:text-white">{title}</h2>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-royal-blue dark:text-light-blue">
          Open
          <ArrowUpRight
            size={14}
            className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
      <div className="mt-5">{children}</div>
    </Link>
  );
}
