import Link from "next/link";
import { notFound } from "next/navigation";
import { getEmailPreviewById, getEmailPreviewDefinitions } from "@/lib/emailPreviews";

type EmailPreviewDetailPageProps = {
  params: Promise<{ templateId: string }>;
};

export function generateStaticParams() {
  return getEmailPreviewDefinitions().map((preview) => ({ templateId: preview.id }));
}

export default async function EmailPreviewDetailPage({ params }: EmailPreviewDetailPageProps) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const { templateId } = await params;
  const preview = getEmailPreviewById(templateId);

  if (!preview) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#E8EEF5] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-primary-navy/[0.08] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dev/emails"
              className="text-sm font-semibold text-royal-blue hover:text-ocean-blue"
            >
              ← All email previews
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-primary-navy">{preview.name}</h1>
            <p className="mt-1 text-sm text-bluewave-gray">{preview.description}</p>
          </div>
          <div className="rounded-xl bg-[#F7FBFF] px-4 py-3 text-sm text-primary-navy">
            <p className="font-semibold">Subject</p>
            <p className="mt-1">{preview.subject}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-primary-navy/[0.08] bg-white shadow-[0_18px_60px_rgba(10,42,94,0.08)]">
          <iframe
            title={`${preview.name} preview`}
            srcDoc={preview.html}
            className="min-h-[920px] w-full border-0 bg-[#E8EEF5]"
          />
        </div>

        <details className="mt-6 rounded-2xl border border-primary-navy/[0.08] bg-white p-5">
          <summary className="cursor-pointer text-sm font-semibold text-primary-navy">
            Plain-text version
          </summary>
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-bluewave-gray">
            {preview.text}
          </pre>
        </details>
      </div>
    </main>
  );
}
