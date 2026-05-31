"use client";

import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock3,
  LifeBuoy,
  Repeat2,
} from "lucide-react";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/lib/formatCurrency";
import { useAccountActivity } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import type { ActivityTimelineItem } from "@/types/banking";

type AccountActivityTimelineProps = {
  accountId?: string;
  limit?: number;
  title?: string;
};

function formatTimelineDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusLabel(status?: string) {
  if (!status) {
    return null;
  }

  if (status === "PENDING") {
    return "Pending Review";
  }

  if (status === "COMPLETED") {
    return "Posted";
  }

  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function TimelineIcon({ item }: { item: ActivityTimelineItem }) {
  if (item.kind === "SUPPORT") {
    return <LifeBuoy size={14} aria-hidden="true" />;
  }

  if (item.kind === "LEDGER") {
    return item.direction === "CREDIT" ? (
      <ArrowDownLeft size={14} aria-hidden="true" />
    ) : (
      <ArrowUpRight size={14} aria-hidden="true" />
    );
  }

  if (item.kind === "TRANSACTION" && item.title.includes("Transfer")) {
    return <Repeat2 size={14} aria-hidden="true" />;
  }

  return <Clock3 size={14} aria-hidden="true" />;
}

function TimelineEntry({ item }: { item: ActivityTimelineItem }) {
  const statusLabel = getStatusLabel(item.status);
  const content = (
    <div className="relative pl-10">
      <span className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-ocean-blue/[0.12] text-royal-blue dark:text-light-blue">
        <TimelineIcon item={item} />
      </span>
      <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-4 dark:border-white/[0.08] dark:bg-white/[0.04]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary-navy dark:text-white">{item.title}</p>
            <p className="mt-1 text-sm leading-6 text-bluewave-gray dark:text-white/[0.58]">
              {item.description}
            </p>
            <p className="mt-2 text-xs text-bluewave-gray dark:text-white/[0.48]">
              {formatTimelineDate(item.createdAt)}
              {item.maskedAccountNumber ? ` | ${item.maskedAccountNumber}` : ""}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            {typeof item.amount === "number" ? (
              <p className="text-sm font-semibold text-primary-navy dark:text-white">
                {item.amount > 0 ? "+" : "-"}
                {formatCurrency(Math.abs(item.amount))}
              </p>
            ) : null}
            {typeof item.balanceAfter === "number" ? (
              <p className="text-xs text-bluewave-gray dark:text-white/[0.48]">
                Balance {formatCurrency(item.balanceAfter)}
              </p>
            ) : null}
            {statusLabel ? (
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  item.status === "PENDING"
                    ? "bg-amber-500/[0.12] text-amber-700 dark:text-amber-300"
                    : item.status === "COMPLETED"
                      ? "bg-emerald-500/[0.12] text-emerald-700 dark:text-emerald-300"
                      : "bg-ocean-blue/[0.10] text-royal-blue dark:text-light-blue",
                )}
              >
                {statusLabel}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  if (item.href) {
    return (
      <Link href={item.href} className="block transition hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}

export function AccountActivityTimeline({
  accountId,
  limit = 12,
  title = "Recent account activity",
}: AccountActivityTimelineProps) {
  const { items, error, isLoading } = useAccountActivity(accountId, limit);

  if (isLoading) {
    return (
      <LoadingState
        title="Loading activity"
        message="Loading your recent account activity."
      />
    );
  }

  return (
    <section className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
      <h2 className="text-lg font-semibold text-primary-navy dark:text-white">{title}</h2>
      <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
        Ledger postings, transfer reviews, and support updates in chronological order.
      </p>

      {error ? (
        <p className="mt-4 text-sm text-red-700 dark:text-red-300">{error}</p>
      ) : items.length > 0 ? (
        <div className="relative mt-6 space-y-5 before:absolute before:bottom-2 before:left-3.5 before:top-2 before:w-px before:bg-primary-navy/[0.08] dark:before:bg-white/[0.08]">
          {items.map((item) => (
            <TimelineEntry key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-bluewave-gray dark:text-white/[0.58]">
          No recent activity yet. Posted transfers and support updates will appear here.
        </p>
      )}
    </section>
  );
}
