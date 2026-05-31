"use client";

import { useState } from "react";
import { AdminStatCards } from "@/components/admin/AdminStatCards";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatStatusLabel, StatusBadge, statusToTone } from "@/components/ui/StatusBadge";
import { useAdminCardApplications } from "@/hooks/useAdminCardApplications";
import { cn } from "@/lib/utils";
import type { CardApplicationStatus } from "@/types/banking";

const statusFilters: Array<CardApplicationStatus | "ALL"> = ["ALL", "PENDING", "APPROVED", "DECLINED"];

export function AdminCardApplicationsClient() {
  const [statusFilter, setStatusFilter] = useState<CardApplicationStatus | "ALL">("PENDING");
  const [reviewNote, setReviewNote] = useState("");
  const { data, error, isLoading, isForbidden, isReviewing, refetch, reviewApplication } =
    useAdminCardApplications(statusFilter);

  if (isLoading) {
    return <LoadingState title="Loading card applications" message="Retrieving card review queue." />;
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
        title="Card applications unavailable"
        message="Card application records could not be loaded."
      />
    );
  }

  const pending = data.applications.filter((application) => application.status === "PENDING");

  return (
    <section className="grid gap-5">
      <AdminStatCards
        items={[
          { label: "Pending review", value: data.summary.pending },
          { label: "Total applications", value: data.summary.total },
          { label: "Displayed", value: data.applications.length },
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
          placeholder="Optional note for the member if declining or requesting follow-up."
        />
      </label>

      {error ? <p className="text-sm text-red-700 dark:text-red-300">{error}</p> : null}

      {pending.length > 0 ? (
        <article className="rounded-lg border border-amber-500/[0.30] bg-amber-500/[0.06] p-5">
          <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Pending review</h2>
          <div className="mt-4 grid gap-4">
            {pending.map((application) => (
              <div
                key={application.id}
                className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.04]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-bluewave-gray dark:text-white/[0.45]">
                        Applicant
                      </p>
                      <p className="mt-1 font-semibold text-primary-navy dark:text-white">
                        {application.user.fullName}
                      </p>
                      <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">
                        {application.user.email}
                      </p>
                      <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">
                        {application.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-bluewave-gray dark:text-white/[0.45]">
                        Request
                      </p>
                      <p className="mt-1 font-semibold text-primary-navy dark:text-white">
                        {application.cardType} Mastercard
                      </p>
                      <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">
                        {application.linkedAccount?.displayName} ·{" "}
                        {application.linkedAccount?.maskedAccountNumber}
                      </p>
                      <StatusBadge
                        label={formatStatusLabel(application.status)}
                        tone={statusToTone(application.status)}
                        className="mt-2"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-bluewave-gray dark:text-white/[0.45]">
                        Mailing address
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-primary-navy dark:text-white/[0.78]">
                        {application.formattedAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isReviewing}
                      onClick={() =>
                        void reviewApplication(application.id, "APPROVE", reviewNote || undefined)
                      }
                      className="rounded-full bg-ocean-blue px-4 py-2 text-sm font-semibold text-primary-navy disabled:opacity-70"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={isReviewing}
                      onClick={() =>
                        void reviewApplication(application.id, "DECLINE", reviewNote || undefined)
                      }
                      className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 dark:border-red-400/30 dark:text-red-300 disabled:opacity-70"
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
        {data.applications.map((application) => (
          <article
            key={application.id}
            className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.04]"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-primary-navy dark:text-white">
                  {application.user.fullName} · {application.cardType} Mastercard
                </p>
                <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">
                  {application.linkedAccount?.displayName} · Submitted{" "}
                  {new Date(application.createdAt).toLocaleString()}
                </p>
              </div>
              <StatusBadge
                label={formatStatusLabel(application.status)}
                tone={statusToTone(application.status)}
              />
            </div>
            {application.reviewNote ? (
              <p className="mt-3 text-sm text-bluewave-gray dark:text-white/[0.62]">
                Note: {application.reviewNote}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
