import { MotionReveal } from "@/components/home/MotionReveal";
import type { MarketingStat } from "@/types/marketing";

type MarketingStatsProps = {
  stats: MarketingStat[];
};

export function MarketingStats({ stats }: MarketingStatsProps) {
  return (
    <section className="bg-background py-10 sm:py-12">
      <div className="section-shell">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <MotionReveal
              key={stat.label}
              delay={index * 0.04}
              className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_70px_rgba(10,42,94,0.08)]"
            >
              <p className="text-3xl font-semibold text-primary-navy">{stat.value}</p>
              <p className="mt-2 text-sm font-medium text-bluewave-gray">{stat.label}</p>
            </MotionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
