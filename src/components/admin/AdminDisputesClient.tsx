"use client";

import { useState } from "react";
import { AdminStatCards } from "@/components/admin/AdminStatCards";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/data/mockBanking";
import { useAdminDisputes } from "@/hooks/useAdminDisputes";
import { cn } from "@/lib/utils";
import type { DisputeStatus } from "@/types/banking";

const filters: Array<DisputeStatus | "ALL"> = [
  "ALL",
  "OPEN",
  "UNDER_REVIEW",
  "RESOLVED",
  "REJECTED",
  "CLOSED",
];

export function AdminDisputesClient() {
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | "ALL">("OPEN");
  const [resolutionNote, setResolutionNote] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, error, isLoading, isForbidden, isUpdating, refetch, updateDispute } =
    useAdminDisputes(statusFilter);

  if (isLoading) {
    return <LoadingState title="Loading disputes" message="Retrieving dispute queue." />;
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

  return (
    <section className="grid gap-5">
      <AdminStatCards
        items={[
          { label: "Open", value: data.summary.open },
          { label: "Under review", value: data.summary.underReview },
          { label: "Total", value: data.summary.total },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
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
            {filter === "ALL" ? "All" : filter.replaceAll("_", " ")}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {data.disputes.map((dispute) => (
          <article
            key={dispute.id}
            className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]"
          >
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="font-semibold">{dispute.userName}</p>
                <p className="text-sm text-bluewave-gray dark:text-white/[0.62]">
                  {dispute.transaction?.reference} — {formatCurrency(Math.abs(dispute.transaction?.amount ?? 0))}
                </p>
                <p className="mt-2 text-sm">{dispute.reason}</p>
                <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.62]">{dispute.description}</p>
              </div>
              <span className="rounded-full bg-primary-navy/10 px-2.5 py-1 text-xs font-semibold dark:bg-white/10">
                {dispute.status.replaceAll("_", " ")}
              </span>
            </div>

            {selectedId === dispute.id ? (
              <textarea
                value={resolutionNote}
                onChange={(event) => setResolutionNote(event.target.value)}
                placeholder="Resolution note (optional)"
                rows={3}
                className="mt-4 w-full rounded-lg border border-primary-navy/[0.10] px-3 py-2 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
              />
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              {(["UNDER_REVIEW", "RESOLVED", "REJECTED", "CLOSED"] as DisputeStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={isUpdating}
                  onClick={() => {
                    setSelectedId(dispute.id);
                    void updateDispute(dispute.id, status, resolutionNote || undefined);
                  }}
                  className="rounded-full border border-primary-navy/[0.12] px-3 py-1.5 text-xs font-semibold dark:border-white/[0.12] dark:text-white"
                >
                  {status.replaceAll("_", " ")}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
