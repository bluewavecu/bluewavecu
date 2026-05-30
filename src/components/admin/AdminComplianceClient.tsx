"use client";

import { useState } from "react";
import { AdminStatCards } from "@/components/admin/AdminStatCards";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAdminCompliance } from "@/hooks/useAdminCompliance";
import { cn } from "@/lib/utils";
import type { KycStatus } from "@/types/banking";

const filters: Array<KycStatus | "ALL"> = [
  "ALL",
  "NOT_STARTED",
  "SUBMITTED",
  "UNDER_REVIEW",
  "VERIFIED",
  "REJECTED",
];

export function AdminComplianceClient() {
  const [statusFilter, setStatusFilter] = useState<KycStatus | "ALL">("SUBMITTED");
  const [reviewNote, setReviewNote] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, error, isLoading, isForbidden, isUpdating, refetch, updateKycStatus } =
    useAdminCompliance(statusFilter);

  if (isLoading) {
    return (
      <LoadingState title="Loading compliance" message="Retrieving customer KYC profiles." />
    );
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
        title="Compliance queue unavailable"
        message="KYC and compliance records could not be loaded. Refresh the page or try again later."
      />
    );
  }

  return (
    <section className="grid gap-5">
      <AdminStatCards
        items={[
          { label: "Submitted", value: data.summary.submitted },
          { label: "Under review", value: data.summary.underReview },
          { label: "Verified", value: data.summary.verified },
          { label: "Rejected", value: data.summary.rejected },
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
        {data.profiles.map((profile) => (
          <article
            key={profile.id}
            className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]"
          >
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="font-semibold">{profile.userName}</p>
                <p className="text-sm text-bluewave-gray dark:text-white/[0.62]">
                  {profile.userEmail} · {profile.userPhone}
                </p>
                <p className="mt-2 text-sm">
                  {profile.addressLine1}
                  {profile.city ? `, ${profile.city}` : ""}
                  {profile.state ? `, ${profile.state}` : ""}
                </p>
                <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.62]">
                  Employment: {profile.employmentStatus ?? "—"}
                </p>
              </div>
              <span className="rounded-full bg-primary-navy/10 px-2.5 py-1 text-xs font-semibold dark:bg-white/10">
                {profile.kycStatus.replaceAll("_", " ")}
              </span>
            </div>

            {selectedId === profile.id ? (
              <textarea
                value={reviewNote}
                onChange={(event) => setReviewNote(event.target.value)}
                placeholder="Review note (required for rejection)"
                rows={3}
                className="mt-4 w-full rounded-lg border border-primary-navy/[0.10] px-3 py-2 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
              />
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isUpdating}
                onClick={() =>
                  void updateKycStatus(profile.id, "UNDER_REVIEW").then((ok) => {
                    if (ok) setSelectedId(null);
                  })
                }
                className="rounded-full bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-800 dark:text-amber-200"
              >
                Mark under review
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() =>
                  void updateKycStatus(profile.id, "VERIFIED").then((ok) => {
                    if (ok) setSelectedId(null);
                  })
                }
                className="rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200"
              >
                Verify
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(profile.id);
                  setReviewNote("");
                }}
                className="rounded-full bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-800 dark:text-red-200"
              >
                Reject
              </button>
              {selectedId === profile.id ? (
                <button
                  type="button"
                  disabled={isUpdating || !reviewNote.trim()}
                  onClick={() =>
                    void updateKycStatus(profile.id, "REJECTED", reviewNote).then((ok) => {
                      if (ok) {
                        setSelectedId(null);
                        setReviewNote("");
                      }
                    })
                  }
                  className="rounded-full border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-700 dark:text-red-300"
                >
                  Confirm rejection
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
