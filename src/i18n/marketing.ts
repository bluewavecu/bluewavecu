import type { MarketingPageConfig } from "@/types/marketing";

type TranslateFn = (key: string) => string;

export function translateMarketingPage(page: MarketingPageConfig, t: TranslateFn): MarketingPageConfig {
  const base = `marketing.pages.${page.slug}`;

  return {
    ...page,
    eyebrow: t(`${base}.eyebrow`),
    title: t(`${base}.title`),
    headline: t(`${base}.headline`),
    description: t(`${base}.description`),
    primaryCta: {
      ...page.primaryCta,
      label: t(`${base}.primaryCta`),
    },
    secondaryCta: page.secondaryCta
      ? {
          ...page.secondaryCta,
          label: t(`${base}.secondaryCta`),
        }
      : undefined,
  };
}
