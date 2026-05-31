import { MotionReveal } from "@/components/home/MotionReveal";
import type { MarketingStat } from "@/types/marketing";

type MarketingStatsProps = {
  stats: MarketingStat[];
};

export function MarketingStats({ stats }: MarketingStatsProps) {
  return (
    <section className="classic-marble border-y border-classic-gold/20 py-10 sm:py-12">
      <div className="section-shell">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <MotionReveal key={stat.label} delay={index * 0.04}>
              <div className="rounded-sm border border-classic-gold/25 bg-white/80 p-5 shadow-[0_18px_70px_rgba(10,42,94,0.06)]">
                <p className="font-display text-3xl font-semibold text-primary-navy">{stat.value}</p>
                <p className="mt-2 text-sm font-medium text-bluewave-gray">{stat.label}</p>
              </div>
            </MotionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
