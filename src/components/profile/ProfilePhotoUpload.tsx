"use client";

import { useRef, useState } from "react";
import { ProfilePhotoAvatar } from "@/components/shared/ProfilePhotoAvatar";
import { cn } from "@/lib/utils";

export const PROFILE_PHOTO_UPDATED_EVENT = "bluewave:profile-photo-updated";

type ProfilePhotoUploadProps = {
  fullName: string;
  profilePhotoUrl?: string | null;
  onUpload: (file: File) => Promise<boolean>;
  onRemove?: () => Promise<boolean>;
  isUploading?: boolean;
  isRemoving?: boolean;
  className?: string;
};

export function ProfilePhotoUpload({
  fullName,
  profilePhotoUrl,
  onUpload,
  isUploading = false,
  className,
}: ProfilePhotoUploadProps) {
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setLocalError(null);
    const ok = await onUpload(file);

    if (!ok) {
      setLocalError("Unable to upload photo. Please try again.");
    }

    return ok;
  }

  return (
    <div className={cn("flex justify-center sm:justify-start", className)}>
      <ProfilePhotoAvatar
        fullName={fullName}
        profilePhotoUrl={profilePhotoUrl}
        onUpload={handleUpload}
        isUploading={isUploading}
      />
      {localError ? (
        <p className="sr-only" role="alert">
          {localError}
        </p>
      ) : null}
    </div>
  );
}

export function notifyProfilePhotoUpdated(profilePhotoUrl: string | null) {
  window.dispatchEvent(
    new CustomEvent(PROFILE_PHOTO_UPDATED_EVENT, {
      detail: { profilePhotoUrl },
    }),
  );
}
