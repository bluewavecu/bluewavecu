import { MarketingCtaBand } from "@/components/marketing/MarketingCtaBand";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MotionReveal } from "@/components/home/MotionReveal";
import { marketingImages, rateRows } from "@/data/marketingPages";
import { ButtonLink } from "@/components/ui/Button";

export function RatesPage() {
  return (
    <MarketingShell>
      <MarketingHero
        eyebrow="Rates"
        headline="Transparent rates across core products"
        description="Compare checking, savings, certificate, and lending starting rates before you open an account or apply."
        heroImage={marketingImages.ratesHero}
        heroImageAlt="Financial charts on a screen"
        primaryCta={{ label: "Open an account", href: "/register" }}
        secondaryCta={{ label: "Talk to a specialist", href: "/contact?topic=rates" }}
      />

      <section className="bg-background py-16 sm:py-20">
        <div className="section-shell">
          <MotionReveal className="overflow-hidden rounded-lg border border-primary-navy/[0.08] bg-white shadow-[0_20px_70px_rgba(10,42,94,0.08)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-primary-navy/[0.08] bg-[#f7fbff]">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-primary-navy">Product</th>
                    <th className="px-5 py-4 font-semibold text-primary-navy">Rate</th>
                    <th className="px-5 py-4 font-semibold text-primary-navy">Minimum</th>
                    <th className="px-5 py-4 font-semibold text-primary-navy">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {rateRows.map((row) => (
                    <tr key={row.product} className="border-b border-primary-navy/[0.06]">
                      <td className="px-5 py-4 font-medium text-primary-navy">{row.product}</td>
                      <td className="px-5 py-4 text-royal-blue">{row.apy}</td>
                      <td className="px-5 py-4 text-bluewave-gray">{row.minBalance}</td>
                      <td className="px-5 py-4 text-bluewave-gray">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </MotionReveal>

          <p className="mt-4 text-xs leading-5 text-bluewave-gray">
            *Rates are subject to change. APR/APY, terms, and eligibility may vary by product and
            member qualification. Federally insured by NCUA.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/savings" size="lg">
              Explore savings
            </ButtonLink>
            <ButtonLink href="/loans" variant="ghost" size="lg" className="border border-primary-navy/[0.10]">
              View lending
            </ButtonLink>
          </div>
        </div>
      </section>

      <MarketingCtaBand />
    </MarketingShell>
  );
}
