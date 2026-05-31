"use client";

import { FileImage, IdCard, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { formatStatusLabel, StatusBadge, statusToTone } from "@/components/ui/StatusBadge";
import { documentTypeRequiresBackPhoto } from "@/lib/idVerificationShared";
import { cn } from "@/lib/utils";
import type { IdDocumentType, IdVerificationRecord } from "@/types/banking";

const documentTypeOptions: Array<{ value: IdDocumentType; label: string }> = [
  { value: "DRIVERS_LICENSE", label: "Driver's license" },
  { value: "STATE_ID", label: "State ID" },
  { value: "PASSPORT", label: "Passport" },
  { value: "NATIONAL_ID", label: "National ID" },
];

type IdVerificationUploadProps = {
  submissions: IdVerificationRecord[];
  canSubmit: boolean;
  isSubmitting?: boolean;
  onSubmit: (input: {
    documentType: IdDocumentType;
    frontPhoto: File;
    backPhoto?: File | null;
  }) => Promise<boolean>;
  className?: string;
};

function PhotoPicker({
  label,
  hint,
  file,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-lg border border-dashed border-primary-navy/[0.16] bg-[#f7fbff] p-4 dark:border-white/[0.12] dark:bg-white/[0.04]">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ocean-blue/15 text-royal-blue dark:text-light-blue">
          <FileImage size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-primary-navy dark:text-white">{label}</p>
          <p className="mt-1 text-xs leading-5 text-bluewave-gray dark:text-white/[0.58]">{hint}</p>
          <p className="mt-2 truncate text-xs text-bluewave-gray dark:text-white/[0.52]">
            {file ? file.name : "No file selected"}
          </p>
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="mt-3 inline-flex h-9 items-center rounded-full border border-primary-navy/[0.12] px-4 text-xs font-semibold text-primary-navy disabled:opacity-70 dark:border-white/[0.12] dark:text-white"
          >
            Choose photo
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => {
              const nextFile = event.target.files?.[0] ?? null;
              event.target.value = "";
              onChange(nextFile);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function IdVerificationUpload({
  submissions,
  canSubmit,
  isSubmitting = false,
  onSubmit,
  className,
}: IdVerificationUploadProps) {
  const [documentType, setDocumentType] = useState<IdDocumentType>("DRIVERS_LICENSE");
  const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
  const [backPhoto, setBackPhoto] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const requiresBackPhoto = useMemo(
    () => documentTypeRequiresBackPhoto(documentType),
    [documentType],
  );

  const latestSubmission = submissions[0] ?? null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    if (!frontPhoto) {
      setLocalError("Upload a clear photo of the front of your ID.");
      return;
    }

    if (requiresBackPhoto && !backPhoto) {
      setLocalError("Upload both the front and back of your ID.");
      return;
    }

    const ok = await onSubmit({
      documentType,
      frontPhoto,
      backPhoto: requiresBackPhoto ? backPhoto : null,
    });

    if (ok) {
      setFrontPhoto(null);
      setBackPhoto(null);
      setSuccessMessage("Your ID photos were submitted for review.");
    }
  }

  return (
    <article
      className={cn(
        "rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ocean-blue/15 text-royal-blue dark:text-light-blue">
          <IdCard size={21} aria-hidden="true" />
        </span>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-primary-navy dark:text-white">ID verification</h2>
          <p className="mt-1 text-sm leading-6 text-bluewave-gray dark:text-white/[0.62]">
            Submit photos of your government-issued ID. Member services will review and approve,
            reject, or decline your submission.
          </p>
        </div>
      </div>

      {latestSubmission ? (
        <div className="mt-4 rounded-lg border border-primary-navy/[0.08] bg-[#f7fbff] p-4 dark:border-white/[0.08] dark:bg-white/[0.04]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-primary-navy dark:text-white">
                Latest submission · {latestSubmission.documentTypeLabel}
              </p>
              <p className="mt-1 text-xs text-bluewave-gray dark:text-white/[0.58]">
                Submitted {new Date(latestSubmission.submittedAt).toLocaleString()}
              </p>
            </div>
            <StatusBadge
              label={formatStatusLabel(latestSubmission.status)}
              tone={statusToTone(latestSubmission.status)}
            />
          </div>
          {latestSubmission.reviewNote ? (
            <p className="mt-3 text-sm text-bluewave-gray dark:text-white/[0.62]">
              Review note: {latestSubmission.reviewNote}
            </p>
          ) : null}
        </div>
      ) : null}

      {canSubmit ? (
        <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 grid gap-4">
          <label className="block">
            <span className="text-sm font-semibold text-primary-navy dark:text-white">
              Document type
            </span>
            <select
              value={documentType}
              onChange={(event) => {
                setDocumentType(event.target.value as IdDocumentType);
                setBackPhoto(null);
              }}
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            >
              {documentTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <PhotoPicker
            label="Front of ID"
            hint="Use a well-lit photo with all corners visible and text easy to read."
            file={frontPhoto}
            onChange={setFrontPhoto}
            disabled={isSubmitting}
          />

          {requiresBackPhoto ? (
            <PhotoPicker
              label="Back of ID"
              hint="Include the full back of your license or state ID."
              file={backPhoto}
              onChange={setBackPhoto}
              disabled={isSubmitting}
            />
          ) : null}

          {localError ? <p className="text-sm text-red-700 dark:text-red-300">{localError}</p> : null}
          {successMessage ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-300">{successMessage}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 w-fit items-center gap-2 rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy disabled:opacity-70"
          >
            <Upload size={16} aria-hidden="true" />
            {isSubmitting ? "Submitting..." : "Submit ID for review"}
          </button>
        </form>
      ) : (
        <p className="mt-4 rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          {latestSubmission?.status === "PENDING"
            ? "Your ID is waiting for review. We'll notify you when member services completes the review."
            : latestSubmission?.status === "APPROVED"
              ? "Your ID verification is approved."
              : "You can submit updated ID photos after reviewing the latest decision above."}
        </p>
      )}
    </article>
  );
}
