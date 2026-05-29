import { AlertCircle, RefreshCw } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  message: string;
  actionLabel?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title = "Unable to load data",
  message,
  actionLabel = "Try Again",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-red-200 bg-red-50 p-6 text-red-900 shadow-[0_18px_60px_rgba(127,29,29,0.08)] dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-50",
        className,
      )}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700 dark:bg-red-400/20 dark:text-red-100">
            <AlertCircle size={21} aria-hidden="true" />
          </span>
          <div>
            <p className="text-base font-semibold">{title}</p>
            <p className="mt-2 text-sm leading-6 text-red-700 dark:text-red-100/80">
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
              className: "shrink-0 bg-white text-red-800 hover:bg-red-100",
            })}
          >
            <RefreshCw size={17} aria-hidden="true" />
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
