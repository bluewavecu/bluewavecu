import Link from "next/link";
import { notFound } from "next/navigation";
import { getEmailPreviewDefinitions } from "@/lib/emailPreviews";
import { blockSearchIndexing } from "@/lib/siteMetadata";

export const metadata = {
  ...blockSearchIndexing,
  title: "Email previews",
};

export default function EmailPreviewIndexPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const previews = getEmailPreviewDefinitions();

  return (
    <main className="min-h-screen bg-[#E8EEF5] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-primary-navy/[0.08] bg-white p-6 shadow-[0_18px_60px_rgba(10,42,94,0.08)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-royal-blue">
            Development only
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-primary-navy">
            Bluewave transactional email previews
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-bluewave-gray">
            Review all member and operations email templates with the Bluewave logo header and
            bank-grade footer before deploying. These previews are not available in production.
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          {previews.map((preview) => (
            <Link
              key={preview.id}
              href={`/dev/emails/${preview.id}`}
              className="rounded-2xl border border-primary-navy/[0.08] bg-white p-5 transition hover:border-ocean-blue/[0.35] hover:shadow-[0_18px_60px_rgba(10,42,94,0.08)]"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-primary-navy">{preview.name}</h2>
                  <p className="mt-1 text-sm text-bluewave-gray">{preview.description}</p>
                </div>
                <p className="text-sm font-medium text-royal-blue">{preview.subject}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
