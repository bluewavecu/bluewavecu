import Image from "next/image";
import { getMemberInitials } from "@/lib/memberAvatar";
import { cn } from "@/lib/utils";

type MemberAvatarProps = {
  fullName: string;
  profilePhotoUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  ring?: boolean;
};

const sizeClasses = {
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-base",
  lg: "h-20 w-20 text-lg",
  xl: "h-28 w-28 text-2xl",
};

const imageSizes = {
  sm: 40,
  md: 56,
  lg: 80,
  xl: 112,
};

export function MemberAvatar({
  fullName,
  profilePhotoUrl,
  size = "md",
  className,
  ring = false,
}: MemberAvatarProps) {
  const initials = getMemberInitials(fullName) || "BW";

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full bg-primary-navy font-semibold text-white",
        sizeClasses[size],
        ring && "ring-4 ring-ocean-blue/30 ring-offset-2 ring-offset-white dark:ring-offset-[#061222]",
        className,
      )}
      aria-hidden={profilePhotoUrl ? undefined : true}
    >
      {profilePhotoUrl ? (
        profilePhotoUrl.startsWith("data:") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profilePhotoUrl}
            alt={`${fullName} profile photo`}
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src={profilePhotoUrl}
            alt={`${fullName} profile photo`}
            width={imageSizes[size]}
            height={imageSizes[size]}
            unoptimized
            className="h-full w-full object-cover"
          />
        )
      ) : (
        <span className="flex h-full w-full items-center justify-center">{initials}</span>
      )}
    </span>
  );
}
