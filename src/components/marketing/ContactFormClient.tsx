"use client";

import { useState } from "react";
import { postJson } from "@/lib/clientApi";

const topics = [
  "General inquiry",
  "Business banking",
  "Loans",
  "Account support",
  "Security concern",
  "Careers",
  "Media inquiry",
  "Rates inquiry",
];

type ContactFormClientProps = {
  defaultTopic?: string;
  defaultMessage?: string;
};

export function ContactFormClient({ defaultTopic, defaultMessage }: ContactFormClientProps) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    topic: defaultTopic ?? "General inquiry",
    message: defaultMessage ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const result = await postJson<{ reference: string }>("/api/contact", form);
    setIsSubmitting(false);

    if (!result.success) {
      setError("error" in result ? result.error : "Unable to send your message.");
      return;
    }

    setSuccess(`Thanks — your message was received. Reference: ${result.data.reference}`);
    setForm({
      fullName: "",
      email: "",
      phone: "",
      topic: defaultTopic ?? "General inquiry",
      message: defaultMessage ?? "",
    });
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="rounded-lg border border-primary-navy/[0.08] bg-white p-6 shadow-[0_20px_70px_rgba(10,42,94,0.08)] sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-primary-navy">Full name</span>
          <input
            required
            value={form.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm outline-none focus:border-ocean-blue"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-primary-navy">Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm outline-none focus:border-ocean-blue"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-primary-navy">Phone</span>
          <input
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm outline-none focus:border-ocean-blue"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-primary-navy">Topic</span>
          <select
            value={form.topic}
            onChange={(event) => setForm((current) => ({ ...current, topic: event.target.value }))}
            className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm outline-none focus:border-ocean-blue"
          >
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-primary-navy">Message</span>
          <textarea
            required
            rows={6}
            value={form.message}
            onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
            className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm outline-none focus:border-ocean-blue"
          />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      {success ? <p className="mt-4 text-sm text-emerald-700">{success}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex h-11 items-center rounded-full bg-ocean-blue px-6 text-sm font-semibold text-primary-navy disabled:opacity-70"
      >
        {isSubmitting ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
