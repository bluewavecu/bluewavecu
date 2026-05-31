import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const authFieldShellClassName =
  "mt-2 flex min-h-[48px] items-center gap-3 rounded-lg border border-primary-navy/[0.10] bg-[#f8fbff] px-4 py-2.5 text-bluewave-gray transition focus-within:border-ocean-blue focus-within:ring-2 focus-within:ring-ocean-blue/20 dark:border-white/[0.10] dark:bg-white/[0.06]";

type AuthFieldProps = {
  label: string;
  htmlFor: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
};

export function AuthField({ label, htmlFor, icon: Icon, children, className }: AuthFieldProps) {
  return (
    <div className={cn("block", className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-primary-navy dark:text-white">
        {label}
      </label>
      <div className={authFieldShellClassName}>
        <Icon size={18} className="shrink-0 text-royal-blue dark:text-light-blue" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}

export const authInputClassName =
  "w-full min-w-0 bg-transparent text-primary-navy outline-none placeholder:text-bluewave-gray/70 dark:text-white";
