"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAdminSupport } from "@/hooks/useAdminSupport";
import { cn } from "@/lib/utils";
import type { SupportTicketPriority, SupportTicketStatus } from "@/types/banking";

const statusFilters: Array<{ label: string; value?: SupportTicketStatus }> = [
  { label: "All statuses" },
  { label: "Open", value: "OPEN" },
  { label: "In progress", value: "PENDING" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
];

const priorityFilters: Array<{ label: string; value?: SupportTicketPriority }> = [
  { label: "All priorities" },
  { label: "Low", value: "LOW" },
  { label: "Normal", value: "NORMAL" },
  { label: "High", value: "HIGH" },
  { label: "Urgent", value: "URGENT" },
];

const statusActions: Array<{ status: SupportTicketStatus; label: string }> = [
  { status: "PENDING", label: "Mark In Progress" },
  { status: "RESOLVED", label: "Resolve" },
  { status: "CLOSED", label: "Close" },
];

function getStatusLabel(status: string) {
  if (status === "PENDING") {
    return "In Progress";
  }

  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusBadgeClass(status: SupportTicketStatus) {
  if (status === "OPEN") {
    return "bg-ocean-blue/[0.10] text-royal-blue dark:text-light-blue";
  }

  if (status === "PENDING") {
    return "bg-amber-500/[0.12] text-amber-700 dark:text-amber-300";
  }

  if (status === "RESOLVED") {
    return "bg-emerald-500/[0.12] text-emerald-700 dark:text-emerald-300";
  }

  return "bg-primary-navy/[0.06] text-primary-navy dark:bg-white/[0.08] dark:text-white";
}

export function AdminSupportClient() {
  const [selectedStatus, setSelectedStatus] = useState<SupportTicketStatus | undefined>();
  const [selectedPriority, setSelectedPriority] = useState<SupportTicketPriority | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      status: selectedStatus,
      priority: selectedPriority,
    }),
    [selectedStatus, selectedPriority],
  );

  const {
    data,
    error,
    isLoading,
    isForbidden,
    isUpdating,
    updateError,
    refetch,
    updateTicketStatus,
  } = useAdminSupport(filters);

  async function handleStatusUpdate(ticketId: string, status: SupportTicketStatus, label: string) {
    const success = await updateTicketStatus(ticketId, status);

    if (success) {
      setSuccessMessage(`Ticket updated: ${label}.`);
      await refetch();
    }
  }

  if (isLoading) {
    return <LoadingState title="Loading support tickets" message="Retrieving support queue." />;
  }

  if (error) {
    return (
      <ApiErrorState
        message={isForbidden ? "Admin access required. Sign in with a demo admin account." : error}
        onRetry={isForbidden ? undefined : refetch}
      />
    );
  }

  const tickets = data?.tickets ?? [];

  return (
    <section className="grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
      <aside className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
        <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Filters</h2>
        <div className="mt-4 grid gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => setSelectedStatus(filter.value)}
              className={cn(
                "rounded-lg border px-4 py-3 text-left text-sm font-semibold transition",
                selectedStatus === filter.value
                  ? "border-ocean-blue bg-ocean-blue/[0.10] text-royal-blue dark:text-light-blue"
                  : "border-primary-navy/[0.08] bg-[#f7fbff] text-primary-navy dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="mt-5 grid gap-2">
          {priorityFilters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => setSelectedPriority(filter.value)}
              className={cn(
                "rounded-lg border px-4 py-3 text-left text-sm font-semibold transition",
                selectedPriority === filter.value
                  ? "border-ocean-blue bg-ocean-blue/[0.10] text-royal-blue dark:text-light-blue"
                  : "border-primary-navy/[0.08] bg-[#f7fbff] text-primary-navy dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </aside>

      <div className="grid gap-4">
        {successMessage ? (
          <p
            role="status"
            className="rounded-lg border border-ocean-blue/[0.20] bg-ocean-blue/[0.08] px-4 py-3 text-sm font-medium text-royal-blue dark:text-light-blue"
          >
            {successMessage}
          </p>
        ) : null}

        {updateError ? (
          <p className="rounded-lg border border-red-500/[0.20] bg-red-500/[0.08] px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
            {updateError}
          </p>
        ) : null}

        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <article
              key={ticket.id}
              className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="font-semibold text-primary-navy dark:text-white">{ticket.subject}</h3>
                  <p className="mt-2 text-sm leading-6 text-bluewave-gray dark:text-white/[0.58]">
                    {ticket.message}
                  </p>
                  <p className="mt-2 text-sm text-bluewave-gray dark:text-white/[0.58]">
                    {ticket.user.fullName} | {ticket.user.email}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2 lg:items-end">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      getStatusBadgeClass(ticket.status),
                    )}
                  >
                    {getStatusLabel(ticket.status)}
                  </span>
                  <span className="text-xs font-semibold text-bluewave-gray dark:text-white/[0.48]">
                    Priority: {getStatusLabel(ticket.priority)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {statusActions.map((action) => (
                  <button
                    key={`${ticket.id}-${action.status}`}
                    type="button"
                    disabled={isUpdating || ticket.status === action.status}
                    onClick={() => void handleStatusUpdate(ticket.id, action.status, action.label)}
                    className="rounded-full border border-primary-navy/[0.08] px-3 py-1.5 text-xs font-semibold transition hover:border-ocean-blue disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.08]"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </article>
          ))
        ) : (
          <EmptyState title="No support tickets found" message="Adjust filters or seed demo tickets." />
        )}
      </div>
    </section>
  );
}
