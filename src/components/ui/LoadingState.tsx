import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingStateProps = {
  title?: string;
  message?: string;
  className?: string;
};

export function LoadingState({
  title = "Loading",
  message = "Preparing your Bluewave data.",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-primary-navy/[0.08] bg-white p-6 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue dark:text-light-blue">
          <LoaderCircle size={21} className="animate-spin" aria-hidden="true" />
        </span>
        <div>
          <p className="text-base font-semibold text-primary-navy dark:text-white">{title}</p>
          <p className="mt-2 text-sm leading-6 text-bluewave-gray dark:text-white/[0.62]">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
