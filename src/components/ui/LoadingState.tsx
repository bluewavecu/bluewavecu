"use client";

import { LoaderCircle } from "lucide-react";
import { useTranslation } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

type LoadingStateProps = {
  title?: string;
  message?: string;
  className?: string;
};

export function LoadingState({ title, message, className }: LoadingStateProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("common.loading");
  const resolvedMessage = message ?? t("common.loadingMessage");

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "rounded-lg border border-primary-navy/[0.08] bg-white p-6 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue dark:text-light-blue">
          <LoaderCircle size={21} className="animate-spin" aria-hidden="true" />
          <span className="sr-only">{resolvedTitle}</span>
        </span>
        <div>
          <p className="text-base font-semibold text-primary-navy dark:text-white">{resolvedTitle}</p>
          <p className="mt-2 text-sm leading-6 text-bluewave-gray dark:text-white/[0.62]">
            {resolvedMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
