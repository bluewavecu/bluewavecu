import { cn } from "@/lib/utils";

type AmountProps = {
  value: number;
  currency?: string;
  className?: string;
  showSign?: boolean;
};

export function Amount({ value, currency = "USD", className, showSign = true }: AmountProps) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    signDisplay: showSign ? "exceptZero" : "auto",
  }).format(value);

  const tone =
    value > 0
      ? "text-emerald-700 dark:text-emerald-300"
      : value < 0
        ? "text-red-700 dark:text-red-300"
        : "text-bluewave-gray dark:text-white/[0.62]";

  return <span className={cn("font-semibold tabular-nums", tone, className)}>{formatted}</span>;
}
