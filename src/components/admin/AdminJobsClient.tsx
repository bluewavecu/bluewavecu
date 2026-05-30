"use client";

import { PlayCircle } from "lucide-react";
import { useState } from "react";
import { AdminStatCards } from "@/components/admin/AdminStatCards";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAdminJobs } from "@/hooks/useAdminJobs";
import { cn } from "@/lib/utils";
import type { JobStatus } from "@/types/banking";

const statusFilters: Array<JobStatus | "ALL"> = [
  "ALL",
  "QUEUED",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
];

const jobTypeFilters = ["ALL", "SCHEDULED_TRANSFER_REVIEW", "BILL_PAYMENT_REVIEW"];

function statusBadgeClass(status: JobStatus) {
  if (status === "COMPLETED") {
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  }

  if (status === "FAILED") {
    return "bg-red-500/15 text-red-700 dark:text-red-300";
  }

  if (status === "RUNNING") {
    return "bg-sky-500/15 text-sky-700 dark:text-sky-300";
  }

  if (status === "QUEUED") {
    return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
  }

  return "bg-primary-navy/10 text-primary-navy dark:bg-white/10 dark:text-white";
}

export function AdminJobsClient() {
  const [statusFilter, setStatusFilter] = useState<JobStatus | "ALL">("ALL");
  const [jobTypeFilter, setJobTypeFilter] = useState("ALL");
  const { data, error, isLoading, isForbidden, isRunning, runSummary, refetch, runDueJobs } =
    useAdminJobs(statusFilter, jobTypeFilter);

  if (isLoading) {
    return <LoadingState title="Loading jobs" message="Retrieving job queue records." />;
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
    return (
      <EmptyState
        title="Jobs unavailable"
        message="Background job records could not be loaded. Refresh the page or try again later."
      />
    );
  }

  const queuedCount = data.summary.byStatus.QUEUED ?? 0;

  return (
    <section className="grid gap-5">
      <AdminStatCards
        items={[
          { label: "Total jobs", value: data.summary.total },
          { label: "Queued", value: queuedCount },
          { label: "Completed", value: data.summary.byStatus.COMPLETED ?? 0 },
          { label: "Failed", value: data.summary.byStatus.FAILED ?? 0 },
        ]}
      />

      <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
              Manual worker trigger
            </h2>
            <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
              Processes due queued jobs only. Review requests are created — balances are never
              posted automatically.
            </p>
          </div>
          <button
            type="button"
            disabled={isRunning}
            onClick={() => void runDueJobs()}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy transition hover:bg-light-blue disabled:cursor-not-allowed disabled:opacity-70"
          >
            <PlayCircle size={16} aria-hidden="true" />
            {isRunning ? "Running..." : "Run due jobs"}
          </button>
        </div>

        {runSummary ? (
          <div className="mt-4 rounded-lg border border-primary-navy/[0.08] bg-[#f7fbff] p-4 text-sm dark:border-white/[0.08] dark:bg-white/[0.04]">
            <p className="font-semibold text-primary-navy dark:text-white">Last run summary</p>
            <p className="mt-2 text-bluewave-gray dark:text-white/[0.70]">
              Processed {runSummary.processed}, completed {runSummary.completed}, failed{" "}
              {runSummary.failed}
            </p>
          </div>
        ) : null}
      </article>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setStatusFilter(filter)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold",
              statusFilter === filter
                ? "bg-ocean-blue text-primary-navy"
                : "border border-primary-navy/[0.10] bg-white dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white",
            )}
          >
            {filter === "ALL" ? "All statuses" : filter}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {jobTypeFilters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setJobTypeFilter(filter)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold",
              jobTypeFilter === filter
                ? "bg-primary-navy text-white"
                : "border border-primary-navy/[0.10] bg-white dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white",
            )}
          >
            {filter === "ALL" ? "All types" : filter.replaceAll("_", " ")}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-primary-navy/[0.08] bg-white dark:border-white/[0.08] dark:bg-white/[0.06]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-primary-navy/[0.08] bg-[#f7fbff] dark:border-white/[0.08] dark:bg-white/[0.04]">
            <tr>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Run at</th>
              <th className="px-4 py-3 font-semibold">Attempts</th>
              <th className="px-4 py-3 font-semibold">Error</th>
            </tr>
          </thead>
          <tbody>
            {data.jobs.map((job) => (
              <tr key={job.id} className="border-b border-primary-navy/[0.06] dark:border-white/[0.06]">
                <td className="px-4 py-3 font-medium">{job.jobType.replaceAll("_", " ")}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold",
                      statusBadgeClass(job.status),
                    )}
                  >
                    {job.status}
                  </span>
                </td>
                <td className="px-4 py-3">{new Date(job.runAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  {job.attempts}/{job.maxAttempts}
                </td>
                <td className="px-4 py-3 text-red-700 dark:text-red-300">{job.error ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
