"use client";

import { useState } from "react";
import { AdminStatCards } from "@/components/admin/AdminStatCards";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatStatusLabel, StatusBadge, statusToTone } from "@/components/ui/StatusBadge";
import { useAdminIdVerifications } from "@/hooks/useAdminIdVerifications";
import { cn } from "@/lib/utils";
import type { IdVerificationStatus } from "@/types/banking";

const statusFilters: Array<IdVerificationStatus | "ALL"> = [
  "ALL",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "DECLINED",
];

function IdPhotoPreview({ label, url }: { label: string; url: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-bluewave-gray dark:text-white/[0.45]">
        {label}
      </p>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-2 block overflow-hidden rounded-lg border border-primary-navy/[0.08] dark:border-white/[0.08]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={label} className="max-h-56 w-full object-contain bg-[#f7fbff] dark:bg-white/[0.04]" />
      </a>
    </div>
  );
}

export function AdminIdVerificationsClient() {
  const [statusFilter, setStatusFilter] = useState<IdVerificationStatus | "ALL">("PENDING");
  const [reviewNote, setReviewNote] = useState("");
  const { data, error, isLoading, isForbidden, isReviewing, refetch, reviewSubmission } =
    useAdminIdVerifications(statusFilter);

  if (isLoading) {
    return <LoadingState title="Loading ID verifications" message="Retrieving ID review queue." />;
  }

  if (error && !data) {
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
        title="ID verifications unavailable"
        message="ID verification records could not be loaded."
      />
    );
  }

  const pending = data.submissions.filter((submission) => submission.status === "PENDING");

  return (
    <section className="grid gap-5">
      <AdminStatCards
        items={[
          { label: "Pending review", value: data.summary.pending },
          { label: "Approved", value: data.summary.approved },
          { label: "Rejected / declined", value: data.summary.rejected + data.summary.declined },
          { label: "Total submissions", value: data.summary.total },
        ]}
      />

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
            {filter === "ALL" ? "All" : formatStatusLabel(filter)}
          </button>
        ))}
      </div>

      <label className="block max-w-xl">
        <span className="text-sm font-semibold text-primary-navy dark:text-white">Review note</span>
        <textarea
          value={reviewNote}
          onChange={(event) => setReviewNote(event.target.value)}
          rows={3}
          className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
          placeholder="Required when rejecting or declining. Optional for approval."
        />
      </label>

      {error ? <p className="text-sm text-red-700 dark:text-red-300">{error}</p> : null}

      {pending.length > 0 ? (
        <article className="rounded-lg border border-amber-500/[0.30] bg-amber-500/[0.06] p-5">
          <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Pending review</h2>
          <div className="mt-4 grid gap-4">
            {pending.map((submission) => (
              <div
                key={submission.id}
                className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.04]"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="grid flex-1 gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-bluewave-gray dark:text-white/[0.45]">
                        Member
                      </p>
                      <p className="mt-1 font-semibold text-primary-navy dark:text-white">
                        {submission.user.fullName}
                      </p>
                      <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">
                        {submission.user.email}
                      </p>
                      <p className="mt-2 text-sm text-primary-navy dark:text-white/[0.78]">
                        {submission.documentTypeLabel} · Submitted{" "}
                        {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <IdPhotoPreview label="Front" url={submission.frontPhotoUrl} />
                      {submission.backPhotoUrl ? (
                        <IdPhotoPreview label="Back" url={submission.backPhotoUrl} />
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isReviewing}
                      onClick={() =>
                        void reviewSubmission(submission.id, "APPROVE", reviewNote || undefined)
                      }
                      className="rounded-full bg-ocean-blue px-4 py-2 text-sm font-semibold text-primary-navy disabled:opacity-70"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={isReviewing || !reviewNote.trim()}
                      onClick={() => void reviewSubmission(submission.id, "REJECT", reviewNote)}
                      className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 dark:border-red-400/30 dark:text-red-300 disabled:opacity-70"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={isReviewing || !reviewNote.trim()}
                      onClick={() => void reviewSubmission(submission.id, "DECLINE", reviewNote)}
                      className="rounded-full border border-amber-400/40 px-4 py-2 text-sm font-semibold text-amber-800 dark:text-amber-200 disabled:opacity-70"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      ) : null}

      <div className="grid gap-3">
        {data.submissions.map((submission) => (
          <article
            key={submission.id}
            className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.04]"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-primary-navy dark:text-white">
                  {submission.user.fullName} · {submission.documentTypeLabel}
                </p>
                <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">
                  Submitted {new Date(submission.submittedAt).toLocaleString()}
                </p>
              </div>
              <StatusBadge
                label={formatStatusLabel(submission.status)}
                tone={statusToTone(submission.status)}
              />
            </div>
            {submission.reviewNote ? (
              <p className="mt-3 text-sm text-bluewave-gray dark:text-white/[0.62]">
                Note: {submission.reviewNote}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
