import { cn } from "@/lib/utils";

type AdminStatCard = {
  label: string;
  value: string | number;
  hint?: string;
};

type AdminStatCardsProps = {
  items: AdminStatCard[];
  className?: string;
};

export function AdminStatCards({ items, className }: AdminStatCardsProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {items.map((item) => (
        <article
          key={item.label}
          className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-bluewave-gray dark:text-white/[0.48]">
            {item.label}
          </p>
          <p className="mt-3 text-3xl font-semibold text-primary-navy dark:text-white">
            {item.value}
          </p>
          {item.hint ? (
            <p className="mt-2 text-sm text-bluewave-gray dark:text-white/[0.58]">{item.hint}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
