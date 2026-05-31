import Image from "next/image";
import Link from "next/link";
import { BRAND_LEGAL_NAME, BRAND_LOGO, BRAND_LOGO_HEIGHT } from "@/lib/branding";
import { cn } from "@/lib/utils";

export { BRAND_LOGO, BRAND_LOGO_HEIGHT };

export function getBrandLogoDimensions(
  displayHeight: number,
  asset: { width: number; height: number } = BRAND_LOGO,
) {
  return {
    width: Math.round((displayHeight * asset.width) / asset.height),
    height: displayHeight,
  };
}

type BrandLogoProps = {
  href?: string;
  displayHeight?: number;
  className?: string;
  priority?: boolean;
  onClick?: () => void;
  /** Light page backgrounds — adds a navy badge so the white logo remains visible */
  tone?: "light" | "dark";
};

export function BrandLogo({
  href = "/",
  displayHeight = BRAND_LOGO_HEIGHT,
  className,
  priority = false,
  onClick,
  tone = "light",
}: BrandLogoProps) {
  const { width, height } = getBrandLogoDimensions(displayHeight);

  const logo = (
    <Image
      src={BRAND_LOGO.src}
      alt={BRAND_LOGO.alt}
      width={width}
      height={height}
      priority={priority}
      unoptimized
      sizes={`${width}px`}
      className="block h-auto max-w-none object-contain object-left"
    />
  );

  const wrappedLogo =
    tone === "dark" ? (
      <span
        className={cn(
          "inline-flex rounded-lg bg-brand-navy px-3 py-1.5",
          "dark:bg-transparent dark:p-0",
        )}
      >
        {logo}
      </span>
    ) : (
      logo
    );

  if (!href) {
    return <span className={cn("inline-flex shrink-0", className)}>{wrappedLogo}</span>;
  }

  return (
    <Link
      href={href}
      aria-label={`${BRAND_LEGAL_NAME} home`}
      className={cn("inline-flex shrink-0", className)}
      onClick={onClick}
    >
      {wrappedLogo}
    </Link>
  );
}
