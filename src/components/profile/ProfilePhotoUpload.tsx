"use client";

import { Camera, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { MemberAvatar } from "@/components/shared/MemberAvatar";
import { cn } from "@/lib/utils";

export const PROFILE_PHOTO_UPDATED_EVENT = "bluewave:profile-photo-updated";

type ProfilePhotoUploadProps = {
  fullName: string;
  profilePhotoUrl?: string | null;
  onUpload: (file: File) => Promise<boolean>;
  onRemove: () => Promise<boolean>;
  isUploading?: boolean;
  isRemoving?: boolean;
  className?: string;
};

export function ProfilePhotoUpload({
  fullName,
  profilePhotoUrl,
  onUpload,
  onRemove,
  isUploading = false,
  isRemoving = false,
  className,
}: ProfilePhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const isBusy = isUploading || isRemoving;

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setLocalError(null);
    const ok = await onUpload(file);

    if (!ok) {
      setLocalError("Unable to upload photo. Use a JPG, PNG, or WEBP file up to 2 MB.");
    }
  }

  async function handleRemove() {
    setLocalError(null);
    const ok = await onRemove();

    if (!ok) {
      setLocalError("Unable to remove photo. Please try again.");
    }
  }

  return (
    <article
      className={cn(
        "rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]",
        className,
      )}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <MemberAvatar fullName={fullName} profilePhotoUrl={profilePhotoUrl} size="xl" ring />

        <div className="flex-1">
          <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Profile photo</h2>
          <p className="mt-1 text-sm leading-6 text-bluewave-gray dark:text-white/[0.62]">
            Add a photo so your dashboard and account header clearly show this is your membership.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => inputRef.current?.click()}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy disabled:opacity-70"
            >
              <Camera size={16} aria-hidden="true" />
              {isUploading ? "Uploading..." : profilePhotoUrl ? "Change photo" : "Upload photo"}
            </button>

            {profilePhotoUrl ? (
              <button
                type="button"
                disabled={isBusy}
                onClick={() => void handleRemove()}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-primary-navy/[0.12] px-5 text-sm font-semibold text-primary-navy disabled:opacity-70 dark:border-white/[0.12] dark:text-white"
              >
                <Trash2 size={16} aria-hidden="true" />
                {isRemoving ? "Removing..." : "Remove photo"}
              </button>
            ) : null}
          </div>

          <p className="mt-3 text-xs text-bluewave-gray dark:text-white/[0.52]">
            JPG, PNG, or WEBP · 2 MB max
          </p>

          {localError ? (
            <p className="mt-3 text-sm text-red-700 dark:text-red-300">{localError}</p>
          ) : null}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => void handleFileChange(event)}
          />
        </div>
      </div>
    </article>
  );
}

export function notifyProfilePhotoUpdated(profilePhotoUrl: string | null) {
  window.dispatchEvent(
    new CustomEvent(PROFILE_PHOTO_UPDATED_EVENT, {
      detail: { profilePhotoUrl },
    }),
  );
}
