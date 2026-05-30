import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminFilterBarProps = {
  children: ReactNode;
  className?: string;
};

export function AdminFilterBar({ children, className }: AdminFilterBarProps) {
  return (
    <div
      className={cn(
        "grid gap-4 rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06] lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

type AdminFilterFieldProps = {
  label: string;
  children: ReactNode;
};

export function AdminFilterField({ label, children }: AdminFilterFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-primary-navy dark:text-white">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export const adminInputClassName =
  "w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm outline-none focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white";

type AdminFilterPillsProps<T extends string> = {
  options: Array<{ label: string; value?: T }>;
  value?: T;
  onChange: (value?: T) => void;
};

export function AdminFilterPills<T extends string>({
  options,
  value,
  onChange,
}: AdminFilterPillsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value === option.value || (!value && !option.value);

        return (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition",
              active
                ? "bg-ocean-blue text-primary-navy"
                : "border border-primary-navy/[0.08] text-primary-navy hover:border-ocean-blue dark:border-white/[0.08] dark:text-white",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
