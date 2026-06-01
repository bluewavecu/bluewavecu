"use client";

type IdDocumentPhotoPreviewProps = {
  label: string;
  url: string;
};

export function IdDocumentPhotoPreview({ label, url }: IdDocumentPhotoPreviewProps) {
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
        <img
          src={url}
          alt={label}
          className="max-h-56 w-full bg-[#f7fbff] object-contain dark:bg-white/[0.04]"
        />
      </a>
    </div>
  );
}

export function IdDocumentPhotoGrid({
  frontPhotoUrl,
  backPhotoUrl,
}: {
  frontPhotoUrl: string;
  backPhotoUrl?: string | null;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <IdDocumentPhotoPreview label="Front" url={frontPhotoUrl} />
      {backPhotoUrl ? <IdDocumentPhotoPreview label="Back" url={backPhotoUrl} /> : null}
    </div>
  );
}
