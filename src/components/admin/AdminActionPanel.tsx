import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminActionPanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
  tone?: "default" | "warning" | "info";
};

export function AdminActionPanel({
  title,
  description,
  children,
  tone = "default",
}: AdminActionPanelProps) {
  return (
    <article
      className={cn(
        "rounded-lg border p-5",
        tone === "warning"
          ? "border-amber-500/[0.30] bg-amber-500/[0.06]"
          : tone === "info"
            ? "border-ocean-blue/[0.24] bg-ocean-blue/[0.06]"
            : "border-primary-navy/[0.08] bg-white shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]",
      )}
    >
      <h3 className="font-semibold text-primary-navy dark:text-white">{title}</h3>
      {description ? (
        <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </article>
  );
}
