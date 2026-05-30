import { AlertTriangle, RefreshCw } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ServerErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
};

export function ServerErrorState({
  title = "Something went wrong",
  message = "Bluewave services are temporarily unavailable. Please try again in a moment.",
  onRetry,
  className,
}: ServerErrorStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-primary-navy/[0.08] bg-white p-6 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]",
        className,
      )}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-500/[0.12] text-amber-700 dark:text-amber-300">
            <AlertTriangle size={21} aria-hidden="true" />
          </span>
          <div>
            <p className="text-base font-semibold text-primary-navy dark:text-white">{title}</p>
            <p className="mt-2 text-sm leading-6 text-bluewave-gray dark:text-white/[0.62]">
              {message}
            </p>
          </div>
        </div>

        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className={buttonVariants({
              variant: "secondary",
              className: "shrink-0",
            })}
          >
            <RefreshCw size={17} aria-hidden="true" />
            Try Again
          </button>
        ) : null}
      </div>
    </div>
  );
}
