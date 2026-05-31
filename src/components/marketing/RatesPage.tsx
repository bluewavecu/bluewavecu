import { MarketingCtaBand } from "@/components/marketing/MarketingCtaBand";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MotionReveal } from "@/components/home/MotionReveal";
import { marketingImages, rateRows } from "@/data/marketingPages";
import { INSTITUTION } from "@/lib/institution";
import { ButtonLink } from "@/components/ui/Button";

export function RatesPage() {
  return (
    <MarketingShell>
      <MarketingHero
        eyebrow="Sample rates"
        headline="Placeholder rates for UI demonstration"
        description="These tables show how product rates could be presented. They are fictional and not offers of credit or deposit products."
        heroImage={marketingImages.ratesHero}
        heroImageAlt="Financial charts on a screen"
        primaryCta={{ label: "Try the demo", href: "/auth/register" }}
        secondaryCta={{ label: "Ask a question", href: "/contact?topic=rates" }}
      />

      <section className="bg-background py-16 sm:py-20">
        <div className="section-shell">
          <MotionReveal className="marketing-panel">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-classic-gold/25 bg-classic-marble">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-primary-navy">Sample product</th>
                    <th className="px-5 py-4 font-semibold text-primary-navy">Rate</th>
                    <th className="px-5 py-4 font-semibold text-primary-navy">Minimum</th>
                    <th className="px-5 py-4 font-semibold text-primary-navy">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {rateRows.map((row) => (
                    <tr key={row.product} className="border-b border-primary-navy/[0.06]">
                      <td className="px-5 py-4 font-medium text-primary-navy">{row.product}</td>
                      <td className="px-5 py-4 font-display text-royal-blue">{row.apy}</td>
                      <td className="px-5 py-4 text-bluewave-gray">{row.minBalance}</td>
                      <td className="px-5 py-4 text-bluewave-gray">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </MotionReveal>

          <p className="mt-4 text-xs leading-5 text-bluewave-gray">{INSTITUTION.publicDisclaimer}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/savings" size="lg">
              Explore savings screens
            </ButtonLink>
            <ButtonLink
              href="/loans"
              variant="ghost"
              size="lg"
              className="border border-primary-navy/10"
            >
              View lending screens
            </ButtonLink>
          </div>
        </div>
      </section>

      <MarketingCtaBand />
    </MarketingShell>
  );
}
