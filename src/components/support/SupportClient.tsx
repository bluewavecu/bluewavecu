"use client";

import { FormEvent, useState } from "react";
import { CircleHelp, Mail, MessageSquareText, Phone } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useSupportTickets } from "@/hooks/useSupportTickets";
import { cn } from "@/lib/utils";
import type { SupportTicketPriority } from "@/types/banking";

const supportContacts = [
  { label: "support@bluewavecu.com", icon: Mail },
  { label: "(646) 776-4480", icon: Phone },
  { label: "Secure message center", icon: MessageSquareText },
];

const priorityOptions: SupportTicketPriority[] = ["LOW", "NORMAL", "HIGH", "URGENT"];

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
    year: "numeric",
  }).format(new Date(value));
}

function getStatusBadgeClass(status: string) {
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

export function SupportClient() {
  const {
    data,
    error,
    isLoading,
    isSubmitting,
    submitError,
    refetch,
    createTicket,
  } = useSupportTickets();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<SupportTicketPriority>("NORMAL");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (isLoading) {
    return <LoadingState title="Loading support" message="Retrieving support tickets." />;
  }

  if (error) {
    return <ApiErrorState message={error} onRetry={refetch} />;
  }

  const tickets = data?.tickets ?? [];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitSuccess(false);

    const ticket = await createTicket({
      subject: subject.trim(),
      message: message.trim(),
      priority,
    });

    if (ticket) {
      setSubject("");
      setMessage("");
      setPriority("NORMAL");
      setSubmitSuccess(true);
    }
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-5">
        <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
          <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
            Support tickets
          </h2>
          {tickets.length > 0 ? (
            <div className="mt-5 divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
              {tickets.map((ticket) => (
                <article key={ticket.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-primary-navy dark:text-white">
                        {ticket.subject}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-bluewave-gray dark:text-white/[0.58]">
                        {ticket.message}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "w-fit rounded-full px-3 py-1 text-xs font-semibold",
                        getStatusBadgeClass(ticket.status),
                      )}
                    >
                      {getStatusLabel(ticket.status)}
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-medium text-bluewave-gray dark:text-white/[0.48]">
                    {formatTicketDate(ticket.createdAt)} | Priority:{" "}
                    {getStatusLabel(ticket.priority)}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No support tickets"
              message="Create your first support ticket using the form below."
              className="mt-5"
            />
          )}
        </div>

        <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
          <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
            Create support ticket
          </h2>
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-semibold text-primary-navy dark:text-white">Subject</span>
              <input
                type="text"
                required
                minLength={3}
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm text-primary-navy outline-none focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-primary-navy dark:text-white">Message</span>
              <textarea
                required
                minLength={10}
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm text-primary-navy outline-none focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-primary-navy dark:text-white">
                Priority
              </span>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as SupportTicketPriority)}
                className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm text-primary-navy outline-none focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
              >
                {priorityOptions.map((option) => (
                  <option key={option} value={option}>
                    {getStatusLabel(option)}
                  </option>
                ))}
              </select>
            </label>

            {submitError ? (
              <p className="rounded-lg border border-red-500/[0.20] bg-red-500/[0.08] px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
                {submitError}
              </p>
            ) : null}

            {submitSuccess ? (
              <p className="rounded-lg border border-ocean-blue/[0.20] bg-ocean-blue/[0.08] px-4 py-3 text-sm font-medium text-royal-blue dark:text-light-blue">
                Support ticket submitted successfully.
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 items-center justify-center rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy transition hover:bg-light-blue disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-5">
        <div className="rounded-lg border border-primary-navy/[0.08] bg-primary-navy p-6 text-white shadow-[0_18px_60px_rgba(10,42,94,0.12)]">
          <CircleHelp size={26} className="text-light-blue" aria-hidden="true" />
          <h2 className="mt-5 text-2xl font-semibold">Member support</h2>
          <p className="mt-3 text-sm leading-6 text-white/[0.68]">
            {tickets.length} authenticated ticket{tickets.length === 1 ? "" : "s"} on file. For
            urgent help, call (646) 776-4480.
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
              <p className="text-sm font-semibold text-primary-navy dark:text-white">{item.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
