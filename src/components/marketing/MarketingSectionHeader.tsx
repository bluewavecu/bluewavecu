import { cn } from "@/lib/utils";

type MarketingSectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  light?: boolean;
  className?: string;
};

export function MarketingSectionHeader({
  eyebrow,
  title,
  description,
  light = false,
  className,
}: MarketingSectionHeaderProps) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <p
        className={cn(
          "text-sm font-semibold uppercase tracking-[0.16em]",
          light ? "text-classic-gold" : "text-ocean-blue",
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          "font-display mt-3 text-3xl font-semibold sm:text-4xl",
          light ? "text-white" : "text-primary-navy",
        )}
      >
        {title}
      </h2>
      <div className="gold-rule mt-6 max-w-xs" aria-hidden="true" />
      {description ? (
        <p
          className={cn(
            "mt-5 text-base leading-7",
            light ? "text-white/[0.72]" : "text-bluewave-gray",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
