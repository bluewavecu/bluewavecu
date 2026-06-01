import Image from "next/image";
import Link from "next/link";
import { AUTH_LOGO, AUTH_LOGO_HEIGHT, BRAND_LEGAL_NAME } from "@/lib/branding";
import { cn } from "@/lib/utils";

type AuthLogoProps = {
  href?: string | null;
  displayHeight?: number;
  className?: string;
  priority?: boolean;
  onClick?: () => void;
};

export function AuthLogo({
  href = "/",
  displayHeight = AUTH_LOGO_HEIGHT,
  className,
  priority = false,
  onClick,
}: AuthLogoProps) {
  const width = Math.round((displayHeight * AUTH_LOGO.width) / AUTH_LOGO.height);

  const logo = (
    <Image
      src={AUTH_LOGO.src}
      alt={AUTH_LOGO.alt}
      width={width}
      height={displayHeight}
      priority={priority}
      unoptimized
      sizes={`${width}px`}
      className="block h-auto max-w-full object-contain object-left"
    />
  );

  if (href === null) {
    return <span className={cn("inline-flex shrink-0", className)}>{logo}</span>;
  }

  if (!href) {
    return <span className={cn("inline-flex shrink-0", className)}>{logo}</span>;
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={`${BRAND_LEGAL_NAME} home`}
      className={cn("inline-flex shrink-0", className)}
    >
      {logo}
    </Link>
  );
}
