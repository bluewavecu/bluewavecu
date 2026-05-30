import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const BRAND_LOGO = {
  src: "/images/logo.webp",
  width: 959,
  height: 231,
} as const;

export function getBrandLogoDimensions(displayHeight: number) {
  return {
    width: Math.round((displayHeight * BRAND_LOGO.width) / BRAND_LOGO.height),
    height: displayHeight,
  };
}

type BrandLogoProps = {
  href?: string;
  displayHeight?: number;
  className?: string;
  priority?: boolean;
  onClick?: () => void;
  /** Use `dark` on light backgrounds (inverts the white logo). Default `light` for navy/dark surfaces. */
  tone?: "light" | "dark";
};

export function BrandLogo({
  href = "/",
  displayHeight = 44,
  className,
  priority = false,
  onClick,
  tone = "light",
}: BrandLogoProps) {
  const { width, height } = getBrandLogoDimensions(displayHeight);

  const logo = (
    <Image
      src={BRAND_LOGO.src}
      alt="Bluewave Credit Union"
      width={width}
      height={height}
      priority={priority}
      sizes={`${width}px`}
      className={cn(
        "block h-auto max-w-none object-contain object-left",
        tone === "dark" && "brightness-0 dark:brightness-100",
      )}
    />
  );

  if (!href) {
    return <span className={cn("inline-flex shrink-0", className)}>{logo}</span>;
  }

  return (
    <Link
      href={href}
      aria-label="Bluewave Credit Union home"
      className={cn("inline-flex shrink-0", className)}
      onClick={onClick}
    >
      {logo}
    </Link>
  );
}
