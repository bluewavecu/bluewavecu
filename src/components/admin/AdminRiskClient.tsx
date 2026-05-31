"use client";

import { useState } from "react";
import { AdminStatCards } from "@/components/admin/AdminStatCards";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAdminRisk } from "@/hooks/useAdminRisk";
import { cn } from "@/lib/utils";
import type { RiskSeverity } from "@/types/banking";

const severityOptions: Array<RiskSeverity | "ALL"> = [
  "ALL",
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AdminRiskClient() {
  const [severityFilter, setSeverityFilter] = useState<RiskSeverity | "ALL">("ALL");
  const { data, error, isLoading, isForbidden, refetch } = useAdminRisk(
    severityFilter === "ALL" ? undefined : severityFilter,
  );

  if (isLoading) {
    return <LoadingState title="Loading risk events" message="Retrieving operational risk data." />;
  }

  if (error) {
    return (
      <ApiErrorState
        message={isForbidden ? "Operations sign-in required." : error}
        onRetry={isForbidden ? undefined : refetch}
      />
    );
  }

  if (!data) {
    return <EmptyState title="No risk data" message="Risk monitoring data is unavailable." />;
  }

  return (
    <section className="grid gap-5">
      <AdminStatCards
        items={[
          { label: "Total events", value: data.summary.total },
          {
            label: "High / critical",
            value: data.summary.highOrCritical,
            hint: "Requires review",
          },
          { label: "Displayed", value: data.events.length, hint: "Latest records" },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        {severityOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSeverityFilter(option)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              severityFilter === option
                ? "bg-ocean-blue text-primary-navy"
                : "border border-primary-navy/[0.10] bg-white text-primary-navy dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white",
            )}
          >
            {option === "ALL" ? "All severities" : option}
          </button>
        ))}
      </div>

      <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
        <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Recent risk events</h2>
        <div className="mt-5 divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
          {data.events.length > 0 ? (
            data.events.map((event) => (
              <div key={event.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-primary-navy dark:text-white">
                      {event.eventType.replaceAll("_", " ")}
                    </p>
                    <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                      {event.user.fullName} | Score {event.riskScore}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-primary-navy dark:text-white/[0.82]">
                      {event.reason}
                    </p>
                    <p className="mt-2 text-xs text-bluewave-gray dark:text-white/[0.48]">
                      {formatDate(event.createdAt)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold",
                      event.severity === "CRITICAL"
                        ? "bg-red-500/[0.12] text-red-700 dark:text-red-300"
                        : event.severity === "HIGH"
                          ? "bg-amber-500/[0.12] text-amber-700 dark:text-amber-300"
                          : event.severity === "MEDIUM"
                            ? "bg-ocean-blue/[0.10] text-royal-blue dark:text-light-blue"
                            : "bg-primary-navy/[0.06] text-primary-navy dark:bg-white/[0.08] dark:text-white",
                    )}
                  >
                    {event.severity}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">
              No risk events match the selected filter.
            </p>
          )}
        </div>
      </article>
    </section>
  );
}
