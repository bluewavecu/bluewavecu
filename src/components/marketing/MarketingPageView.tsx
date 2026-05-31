"use client";

import { MarketingCtaBand } from "@/components/marketing/MarketingCtaBand";
import { MarketingFeatures } from "@/components/marketing/MarketingFeatures";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MarketingSplitSection } from "@/components/marketing/MarketingSplitSection";
import { MarketingStats } from "@/components/marketing/MarketingStats";
import { translateMarketingPage } from "@/i18n/marketing";
import { useTranslation } from "@/i18n/LocaleProvider";
import type { MarketingPageConfig } from "@/types/marketing";

type MarketingPageViewProps = {
  page: MarketingPageConfig;
};

export function MarketingPageView({ page }: MarketingPageViewProps) {
  const { t } = useTranslation();
  const localizedPage = translateMarketingPage(page, t);

  return (
    <MarketingShell>
      <MarketingHero
        eyebrow={localizedPage.eyebrow}
        headline={localizedPage.headline}
        description={localizedPage.description}
        heroImage={localizedPage.heroImage}
        heroImageAlt={localizedPage.heroImageAlt}
        primaryCta={localizedPage.primaryCta}
        secondaryCta={localizedPage.secondaryCta}
      />
      {localizedPage.stats ? <MarketingStats stats={localizedPage.stats} /> : null}
      {localizedPage.features ? <MarketingFeatures features={localizedPage.features} /> : null}
      {localizedPage.splits?.map((block) => (
        <MarketingSplitSection key={block.title} block={block} />
      ))}
      <MarketingCtaBand />
    </MarketingShell>
  );
}
