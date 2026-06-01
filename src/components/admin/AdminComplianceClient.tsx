"use client";

import { useState } from "react";
import { AdminStatCards } from "@/components/admin/AdminStatCards";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  type ComplianceStatusFilter,
  useAdminCompliance,
} from "@/hooks/useAdminCompliance";
import { IdDocumentPhotoGrid } from "@/components/admin/IdDocumentPhotoPreview";
import { cn } from "@/lib/utils";
import type { KycStatus } from "@/types/banking";

const filters: Array<{ value: ComplianceStatusFilter; label: string }> = [
  { value: "NEEDS_REVIEW", label: "Needs review" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "NOT_STARTED", label: "Not started" },
  { value: "VERIFIED", label: "Verified" },
  { value: "REJECTED", label: "Rejected" },
];

function formatStatusLabel(status: KycStatus) {
  return status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isReviewableStatus(status: KycStatus) {
  return status !== "VERIFIED" && status !== "REJECTED";
}

export function AdminComplianceClient() {
  const [statusFilter, setStatusFilter] = useState<ComplianceStatusFilter>("NEEDS_REVIEW");
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
        message={isForbidden ? "Operations sign-in required." : error}
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

  const queueCount =
    data.summary.notStarted + data.summary.submitted + data.summary.underReview;

  return (
    <section className="grid gap-5">
      <AdminStatCards
        items={[
          { label: "Needs review", value: queueCount },
          { label: "Submitted", value: data.summary.submitted },
          { label: "Verified", value: data.summary.verified },
          { label: "Rejected", value: data.summary.rejected },
        ]}
      />

      {statusFilter === "NEEDS_REVIEW" ? (
        <p className="text-sm text-bluewave-gray dark:text-white/[0.62]">
          Verified and rejected profiles are hidden from this queue. Use the Verified or Rejected
          tabs to review completed decisions.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setStatusFilter(filter.value)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold",
              statusFilter === filter.value
                ? "bg-ocean-blue text-primary-navy"
                : "border border-primary-navy/[0.10] bg-white dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {data.profiles.length === 0 ? (
        <EmptyState
          title={
            statusFilter === "NEEDS_REVIEW"
              ? "Review queue is clear"
              : `No ${filters.find((filter) => filter.value === statusFilter)?.label.toLowerCase()} profiles`
          }
          message={
            statusFilter === "NEEDS_REVIEW"
              ? "There are no profiles waiting for KYC review right now."
              : "Try another filter to review member profiles."
          }
        />
      ) : (
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
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold",
                    profile.kycStatus === "VERIFIED" &&
                      "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200",
                    profile.kycStatus === "REJECTED" &&
                      "bg-red-500/15 text-red-800 dark:text-red-200",
                    profile.kycStatus === "UNDER_REVIEW" &&
                      "bg-amber-500/15 text-amber-800 dark:text-amber-200",
                    profile.kycStatus === "SUBMITTED" &&
                      "bg-ocean-blue/15 text-primary-navy dark:text-light-blue",
                    profile.kycStatus === "NOT_STARTED" &&
                      "bg-primary-navy/10 text-primary-navy dark:bg-white/10 dark:text-white",
                  )}
                >
                  {formatStatusLabel(profile.kycStatus)}
                </span>
              </div>

              {profile.latestIdVerification ? (
                <div className="mt-4 rounded-lg border border-primary-navy/[0.08] bg-[#f7fbff] p-4 dark:border-white/[0.08] dark:bg-white/[0.04]">
                  <p className="text-sm font-semibold text-primary-navy dark:text-white">
                    Uploaded ID · {profile.latestIdVerification.documentTypeLabel}
                  </p>
                  <p className="mt-1 text-xs text-bluewave-gray dark:text-white/[0.58]">
                    Submitted{" "}
                    {new Date(profile.latestIdVerification.submittedAt).toLocaleString()} ·{" "}
                    {profile.latestIdVerification.status.replaceAll("_", " ").toLowerCase()}
                  </p>
                  <div className="mt-4">
                    <IdDocumentPhotoGrid
                      frontPhotoUrl={profile.latestIdVerification.frontPhotoUrl}
                      backPhotoUrl={profile.latestIdVerification.backPhotoUrl}
                    />
                  </div>
                </div>
              ) : profile.kycStatus !== "NOT_STARTED" ? (
                <p className="mt-4 rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
                  No ID photos on file for this member. Check ID verifications or ask them to
                  re-upload from Profile.
                </p>
              ) : null}

              {isReviewableStatus(profile.kycStatus) ? (
                <>
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
                      disabled={isUpdating || profile.kycStatus === "UNDER_REVIEW"}
                      onClick={() =>
                        void updateKycStatus(profile.id, "UNDER_REVIEW").then((ok) => {
                          if (ok) setSelectedId(null);
                        })
                      }
                      className="rounded-full bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-800 disabled:cursor-not-allowed disabled:opacity-50 dark:text-amber-200"
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
                </>
              ) : profile.kycReviewNote ? (
                <p className="mt-4 rounded-lg border border-primary-navy/[0.08] bg-[#f7fbff] px-4 py-3 text-sm text-bluewave-gray dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/[0.62]">
                  Review note: {profile.kycReviewNote}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
