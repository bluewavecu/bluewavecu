"use client";

import Link from "next/link";
import { AlertTriangle, ArrowUpRight, RefreshCw } from "lucide-react";
import type { AdminOperationalAlert } from "@/types/banking";
import { cn } from "@/lib/utils";

type AdminOperationalAlertsProps = {
  alerts: AdminOperationalAlert[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
};

function OperationalAlertCard({ alert }: { alert: AdminOperationalAlert }) {
  const cardClassName = cn(
    "rounded-lg border p-4 transition",
    alert.severity === "warning"
      ? "border-amber-500/[0.30] bg-amber-500/[0.06]"
      : "border-primary-navy/[0.08] bg-[#f7fbff] dark:border-white/[0.08] dark:bg-white/[0.04]",
    alert.href &&
      "group hover:border-ocean-blue/35 hover:shadow-[0_12px_34px_rgba(0,168,232,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-blue/40",
  );

  const content = (
    <div className="flex items-start gap-3">
      <AlertTriangle
        size={18}
        className={cn(
          "mt-0.5 shrink-0",
          alert.severity === "warning" ? "text-amber-600 dark:text-amber-300" : "text-ocean-blue",
        )}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold text-primary-navy dark:text-white">{alert.title}</p>
          {alert.href ? (
            <ArrowUpRight
              size={16}
              className="shrink-0 text-royal-blue opacity-70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 dark:text-light-blue"
              aria-hidden="true"
            />
          ) : null}
        </div>
        <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">{alert.message}</p>
        {alert.href ? (
          <p className="mt-2 text-xs font-semibold text-royal-blue dark:text-light-blue">Review now</p>
        ) : null}
      </div>
    </div>
  );

  if (alert.href) {
    return (
      <Link href={alert.href} className={cn(cardClassName, "block")} aria-label={`Review: ${alert.title}`}>
        {content}
      </Link>
    );
  }

  return <div className={cardClassName}>{content}</div>;
}

export function AdminOperationalAlerts({
  alerts,
  isLoading,
  error,
  onRefresh,
}: AdminOperationalAlertsProps) {
  return (
    <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Operational alerts</h2>
        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1 text-sm font-semibold text-royal-blue dark:text-light-blue"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Refresh
          </button>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-bluewave-gray dark:text-white/[0.58]">
        Pending reviews, open tickets, disputes, and security activity requiring attention. Click any
        alert to jump straight to the review queue.
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {isLoading ? (
          <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">Loading alerts...</p>
        ) : error ? (
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        ) : alerts.length > 0 ? (
          alerts.map((alert) => <OperationalAlertCard key={alert.id} alert={alert} />)
        ) : (
          <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">No operational alerts.</p>
        )}
      </div>
    </article>
  );
}
