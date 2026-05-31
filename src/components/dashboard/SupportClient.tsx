"use client";

import { CircleHelp, Mail, MessageSquareText, Phone } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useDashboardData } from "@/hooks/useDashboardData";
import { INSTITUTION } from "@/lib/institution";

const supportContacts = [
  { label: INSTITUTION.email, icon: Mail },
  { label: INSTITUTION.phone.display, icon: Phone },
  { label: "Secure message center", icon: MessageSquareText },
];

function getStatusLabel(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatTicketDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function SupportClient() {
  const { data, error, isLoading, refetch } = useDashboardData();

  if (isLoading) {
    return <LoadingState title="Loading support" message="Retrieving support ticket summary." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const summary = data?.supportTicketSummary;

  if (!summary) {
    return (
      <EmptyState
        title="No support summary"
        message="Sign in to view and manage your support requests."
      />
    );
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
        <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
          Support messages
        </h2>
        {summary.recentTickets.length > 0 ? (
          <div className="mt-5 divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
            {summary.recentTickets.map((message) => (
              <article key={message.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-primary-navy dark:text-white">
                      {message.subject}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-bluewave-gray dark:text-white/[0.58]">
                      {message.message}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-ocean-blue/[0.10] px-3 py-1 text-xs font-semibold text-royal-blue dark:text-light-blue">
                    {getStatusLabel(message.status)}
                  </span>
                </div>
                <p className="mt-3 text-xs font-medium text-bluewave-gray dark:text-white/[0.48]">
                  {formatTicketDate(message.createdAt)} | Priority:{" "}
                  {getStatusLabel(message.priority)}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No support tickets"
            message="Submit a support request from Member Support when you need assistance."
            className="mt-5"
          />
        )}
      </div>

      <div className="grid gap-5">
        <div className="rounded-lg border border-primary-navy/[0.08] bg-primary-navy p-6 text-white shadow-[0_18px_60px_rgba(10,42,94,0.12)]">
          <CircleHelp size={26} className="text-light-blue" aria-hidden="true" />
          <h2 className="mt-5 text-2xl font-semibold">Support summary</h2>
          <p className="mt-3 text-sm leading-6 text-white/[0.68]">
            {summary.open} open, {summary.pending} pending, {summary.resolved} resolved,
            and {summary.urgent} urgent tickets from {summary.total} total records.
          </p>
        </div>

        {supportContacts.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex items-center gap-4 rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue dark:text-light-blue">
                <Icon size={20} aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold text-primary-navy dark:text-white">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
