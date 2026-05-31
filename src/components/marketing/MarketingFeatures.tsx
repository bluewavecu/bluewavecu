import { MotionReveal } from "@/components/home/MotionReveal";
import { MarketingSectionHeader } from "@/components/marketing/MarketingSectionHeader";
import type { MarketingFeature } from "@/types/marketing";

type MarketingFeaturesProps = {
  title?: string;
  features: MarketingFeature[];
};

export function MarketingFeatures({ title = "What you get", features }: MarketingFeaturesProps) {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="section-shell">
        <MotionReveal>
          <MarketingSectionHeader eyebrow="Features" title={title} />
        </MotionReveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <MotionReveal
                key={feature.title}
                delay={index * 0.04}
                className="marketing-card"
              >
                <span className="marketing-icon-wrap">
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
