import { MotionReveal } from "@/components/home/MotionReveal";
import type { MarketingFeature } from "@/types/marketing";

type MarketingFeaturesProps = {
  title?: string;
  features: MarketingFeature[];
};

export function MarketingFeatures({ title = "What you get", features }: MarketingFeaturesProps) {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="section-shell">
        <MotionReveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase text-ocean-blue">Features</p>
          <h2 className="mt-3 text-3xl font-semibold text-primary-navy sm:text-4xl">{title}</h2>
        </MotionReveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <MotionReveal
                key={feature.title}
                delay={index * 0.04}
                className="rounded-lg border border-primary-navy/[0.08] bg-white p-6 shadow-[0_16px_60px_rgba(10,42,94,0.08)] transition hover:-translate-y-1 hover:border-ocean-blue/[0.38]"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue">
                  <Icon size={23} aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-primary-navy">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-bluewave-gray">{feature.description}</p>
              </MotionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
