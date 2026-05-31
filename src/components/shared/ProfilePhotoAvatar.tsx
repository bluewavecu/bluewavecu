"use client";

import { Camera } from "lucide-react";
import { useRef } from "react";
import { MemberAvatar } from "@/components/shared/MemberAvatar";
import { cn } from "@/lib/utils";

type ProfilePhotoAvatarProps = {
  fullName: string;
  profilePhotoUrl?: string | null;
  onUpload: (file: File) => Promise<boolean>;
  isUploading?: boolean;
  size?: "lg" | "xl";
  className?: string;
};

export function ProfilePhotoAvatar({
  fullName,
  profilePhotoUrl,
  onUpload,
  isUploading = false,
  size = "xl",
  className,
}: ProfilePhotoAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    await onUpload(file);
  }

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <MemberAvatar fullName={fullName} profilePhotoUrl={profilePhotoUrl} size={size} ring />

      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className="absolute bottom-0 right-0 inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-ocean-blue text-primary-navy shadow-[0_8px_24px_rgba(0,168,232,0.35)] transition hover:bg-light-blue disabled:opacity-70 dark:border-[#061222]"
        aria-label={isUploading ? "Uploading photo" : "Upload profile photo"}
      >
        <Camera size={16} aria-hidden="true" />
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => void handleFileChange(event)}
      />
    </div>
  );
}
