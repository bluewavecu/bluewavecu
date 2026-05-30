"use client";

import { useState } from "react";
import { AdminStatCards } from "@/components/admin/AdminStatCards";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAdminEventLogs } from "@/hooks/useAdminEventLogs";
import { cn } from "@/lib/utils";
import type { EventSeverity } from "@/types/banking";

const severities: Array<EventSeverity | "ALL"> = ["ALL", "INFO", "WARNING", "ERROR", "CRITICAL"];

function severityClass(severity: EventSeverity) {
  if (severity === "CRITICAL") {
    return "bg-red-500/15 text-red-700 dark:text-red-300";
  }

  if (severity === "ERROR") {
    return "bg-orange-500/15 text-orange-700 dark:text-orange-300";
  }

  if (severity === "WARNING") {
    return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
  }

  return "bg-sky-500/15 text-sky-700 dark:text-sky-300";
}

export function AdminEventLogsClient() {
  const [severityFilter, setSeverityFilter] = useState<EventSeverity | "ALL">("ALL");
  const [eventTypeFilter, setEventTypeFilter] = useState("ALL");
  const { data, error, isLoading, isForbidden, refetch } = useAdminEventLogs(severityFilter, eventTypeFilter);

  if (isLoading) {
    return <LoadingState title="Loading event logs" message="Retrieving append-only event history." />;
  }

  if (error) {
    return (
      <ApiErrorState
        message={isForbidden ? "Admin access required." : error}
        onRetry={isForbidden ? undefined : refetch}
      />
    );
  }

  if (!data) {
    return null;
  }

  const eventTypes = Array.from(new Set(data.events.map((event) => event.eventType))).sort();

  return (
    <section className="grid gap-5">
      <article className="rounded-lg border border-primary-navy/[0.08] bg-[#f7fbff] p-4 text-sm dark:border-white/[0.08] dark:bg-white/[0.04]">
        Event logs are append-only and read-only. Sensitive secrets are never stored in metadata.
      </article>

      <AdminStatCards
        items={[
          { label: "Displayed", value: data.events.length },
          { label: "Total", value: data.summary.total },
          { label: "Critical", value: data.summary.bySeverity.CRITICAL ?? 0 },
          { label: "Errors", value: data.summary.bySeverity.ERROR ?? 0 },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        {severities.map((severity) => (
          <button
            key={severity}
            type="button"
            onClick={() => setSeverityFilter(severity)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold",
              severityFilter === severity ? "bg-ocean-blue text-primary-navy" : "border bg-white dark:bg-white/[0.06] dark:text-white",
            )}
          >
            {severity}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setEventTypeFilter("ALL")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold",
            eventTypeFilter === "ALL" ? "bg-primary-navy text-white" : "border bg-white dark:bg-white/[0.06] dark:text-white",
          )}
        >
          All types
        </button>
        {eventTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setEventTypeFilter(type)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold",
              eventTypeFilter === type ? "bg-primary-navy text-white" : "border bg-white dark:bg-white/[0.06] dark:text-white",
            )}
          >
            {type.replaceAll("_", " ")}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {data.events.map((event) => (
          <article key={event.id} className="rounded-lg border bg-white p-4 dark:border-white/[0.08] dark:bg-white/[0.06]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{event.eventType.replaceAll("_", " ")}</p>
              <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", severityClass(event.severity))}>
                {event.severity}
              </span>
            </div>
            <p className="mt-2 text-sm">{event.message}</p>
            <p className="mt-2 text-xs text-bluewave-gray dark:text-white/[0.58]">
              {event.entityType}
              {event.entityId ? ` · ${event.entityId}` : ""} · {new Date(event.createdAt).toLocaleString()}
            </p>
            {event.metadata ? (
              <pre className="mt-3 overflow-x-auto rounded-lg bg-[#f7fbff] p-3 text-xs dark:bg-white/[0.04]">
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
