import { MarketingCtaBand } from "@/components/marketing/MarketingCtaBand";
import { MarketingFeatures } from "@/components/marketing/MarketingFeatures";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MarketingSplitSection } from "@/components/marketing/MarketingSplitSection";
import { MarketingStats } from "@/components/marketing/MarketingStats";
import type { MarketingPageConfig } from "@/types/marketing";

type MarketingPageViewProps = {
  page: MarketingPageConfig;
};

export function MarketingPageView({ page }: MarketingPageViewProps) {
  return (
    <MarketingShell>
      <MarketingHero
        eyebrow={page.eyebrow}
        headline={page.headline}
        description={page.description}
        heroImage={page.heroImage}
        heroImageAlt={page.heroImageAlt}
        primaryCta={page.primaryCta}
        secondaryCta={page.secondaryCta}
      />
      {page.stats ? <MarketingStats stats={page.stats} /> : null}
      {page.features ? <MarketingFeatures features={page.features} /> : null}
      {page.splits?.map((block) => (
        <MarketingSplitSection key={block.title} block={block} />
      ))}
      <MarketingCtaBand />
    </MarketingShell>
  );
}
