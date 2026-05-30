import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type InfoPanelProps = {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  variant?: "default" | "warning" | "success" | "brand";
  className?: string;
};

const variantClasses = {
  default:
    "border-primary-navy/[0.08] bg-white dark:border-white/[0.08] dark:bg-white/[0.06] text-primary-navy dark:text-white",
  warning: "border-amber-500/30 bg-amber-500/10 text-primary-navy dark:text-white",
  success:
    "border-emerald-500/30 bg-emerald-500/10 text-primary-navy dark:text-white",
  brand: "border-primary-navy/[0.08] bg-primary-navy text-white",
};

export function InfoPanel({
  title,
  children,
  icon,
  variant = "default",
  className,
}: InfoPanelProps) {
  return (
    <section
      className={cn(
        "rounded-lg border p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)]",
        variantClasses[variant],
        className,
      )}
    >
      <div className="flex gap-4">
        {icon ? (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue dark:text-light-blue">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div
            className={cn(
              "mt-2 text-sm leading-6",
              variant === "brand" ? "text-white/[0.68]" : "text-bluewave-gray dark:text-white/[0.62]",
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
