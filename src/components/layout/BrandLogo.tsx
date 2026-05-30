import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const BRAND_LOGO = {
  src: "/images/logo.webp",
  width: 2172,
  height: 724,
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
  /** @deprecated Full-color logo includes its own background; tone is ignored. */
  tone?: "light" | "dark";
};

export function BrandLogo({
  href = "/",
  displayHeight = 44,
  className,
  priority = false,
  onClick,
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
      className="block h-auto max-w-none object-contain object-left"
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
