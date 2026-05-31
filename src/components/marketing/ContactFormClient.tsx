"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
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
  const [thankYouReference, setThankYouReference] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!thankYouReference) {
      return;
    }

    const timer = window.setTimeout(() => {
      setThankYouReference(null);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [thankYouReference]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await postJson<{ reference: string }>("/api/contact", form);
    setIsSubmitting(false);

    if (!result.success) {
      setError("error" in result ? result.error : "Unable to send your message.");
      return;
    }

    setThankYouReference(result.data.reference);
    setForm({
      fullName: "",
      email: "",
      phone: "",
      topic: defaultTopic ?? "General inquiry",
      message: defaultMessage ?? "",
    });
  }

  return (
    <>
      {thankYouReference ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close thank you message"
            className="absolute inset-0 bg-primary-navy/45 backdrop-blur-sm"
            onClick={() => setThankYouReference(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-thank-you-title"
            className="relative w-full max-w-md rounded-2xl border border-primary-navy/[0.08] bg-white p-8 text-center shadow-[0_24px_80px_rgba(10,42,94,0.18)]"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </div>
            <h2 id="contact-thank-you-title" className="mt-5 text-2xl font-semibold text-primary-navy">
              Thank you
            </h2>
            <p className="mt-3 text-sm leading-6 text-primary-navy/75">
              We received your message. A confirmation email is on its way, and our team will follow up
              soon.
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-primary-navy/55">
              Reference {thankYouReference}
            </p>
            <p className="mt-4 text-xs text-primary-navy/45">This message will close automatically.</p>
          </div>
        </div>
      ) : null}

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

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 inline-flex h-11 items-center rounded-full bg-ocean-blue px-6 text-sm font-semibold text-primary-navy disabled:opacity-70"
        >
          {isSubmitting ? "Sending..." : "Send message"}
        </button>
      </form>
    </>
  );
}
