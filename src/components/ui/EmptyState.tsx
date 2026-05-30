import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title?: string;
  message: string;
  className?: string;
};

export function EmptyState({
  title = "No data available",
  message,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-lg border border-dashed border-primary-navy/[0.18] bg-white p-6 text-center shadow-[0_18px_60px_rgba(10,42,94,0.06)] dark:border-white/[0.18] dark:bg-white/[0.06]",
        className,
      )}
    >
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue dark:text-light-blue">
        <Inbox size={22} aria-hidden="true" />
      </span>
      <p className="mt-4 text-base font-semibold text-primary-navy dark:text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-bluewave-gray dark:text-white/[0.62]">
        {message}
      </p>
    </div>
  );
}
