"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DetailDrawerProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function DetailDrawer({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
}: DetailDrawerProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        aria-label="Close details"
        className="absolute inset-0 bg-primary-navy/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-drawer-title"
        className="relative flex h-full w-full max-w-md flex-col border-l border-primary-navy/[0.08] bg-white shadow-2xl dark:border-white/[0.08] dark:bg-[#071526]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-primary-navy/[0.08] p-5 dark:border-white/[0.08]">
          <div>
            <h2 id="detail-drawer-title" className="text-lg font-semibold text-primary-navy dark:text-white">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Close panel"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary-navy/[0.10] text-primary-navy dark:border-white/[0.10] dark:text-white"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer ? (
          <div className={cn("border-t border-primary-navy/[0.08] p-5 dark:border-white/[0.08]")}>
            {footer}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
