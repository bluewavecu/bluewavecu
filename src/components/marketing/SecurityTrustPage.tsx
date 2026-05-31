import Link from "next/link";
import { MarketingCtaBand } from "@/components/marketing/MarketingCtaBand";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MarketingSplitSection } from "@/components/marketing/MarketingSplitSection";
import { MotionReveal } from "@/components/home/MotionReveal";
import { marketingImages, securityHighlights } from "@/data/marketingPages";
import { INSTITUTION } from "@/lib/institution";
import { MEMBER_SECURITY_PATH } from "@/lib/memberRoutes";
import { ButtonLink } from "@/components/ui/Button";

export function SecurityTrustPage() {
  return (
    <MarketingShell>
      <MarketingHero
        eyebrow="Security"
        headline="Trust, visibility, and control for every session"
        description="Bluewave protects member accounts with layered authentication, session monitoring, and careful review of sensitive financial activity."
        heroImage={marketingImages.securityHero}
        heroImageAlt="Secure online banking on a laptop"
        primaryCta={{ label: "Sign in to manage security", href: "/auth" }}
        secondaryCta={{ label: "Report a concern", href: "/contact?topic=security" }}
      />

      <section className="bg-background py-16 sm:py-20">
        <div className="section-shell grid gap-4 lg:grid-cols-2">
          {securityHighlights.map((item, index) => {
            const Icon = item.icon;

            return (
              <MotionReveal
                key={item.title}
                delay={index * 0.04}
                className="rounded-lg border border-primary-navy/[0.08] bg-white p-6 shadow-[0_18px_70px_rgba(10,42,94,0.08)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-xl font-semibold text-primary-navy">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-bluewave-gray">{item.description}</p>
              </MotionReveal>
            );
          })}
        </div>
      </section>

      <MarketingSplitSection
        block={{
          eyebrow: "Secure by design",
          title: "Protection across sign-in, sessions, and sensitive actions",
          description:
            "Bluewave combines authentication controls with monitoring for unusual transfers, bill payments, and account changes so members stay informed.",
          bullets: [
            "Optional MFA for additional sign-in protection",
            "Session list with revoke controls",
            "Extra review for high-value activity",
          ],
          image: marketingImages.securitySplit,
          imageAlt: "Secure online banking verification on a laptop",
          reverse: true,
        }}
      />

      <section className="bg-primary-navy py-16 text-white sm:py-20">
        <div className="section-shell grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <MotionReveal>
            <p className="text-sm font-semibold uppercase text-light-blue">Member controls</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Review devices, enable MFA, and revoke sessions
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/[0.72]">
              Signed-in members can manage active sessions and security preferences from the
              Security center in online banking.
            </p>
          </MotionReveal>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/auth" variant="light" size="lg">
              Sign in
            </ButtonLink>
            <ButtonLink href={MEMBER_SECURITY_PATH} variant="secondary" size="lg">
              Security center
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="bg-background py-10">
        <div className="section-shell">
          <p className="text-xs leading-5 text-bluewave-gray">
            If you suspect unauthorized activity, contact member services immediately at{" "}
            <Link href={`tel:${INSTITUTION.phone.tel}`} className="font-semibold text-royal-blue">
              {INSTITUTION.phone.display}
            </Link>{" "}
            or through the{" "}
            <Link href="/contact?topic=security" className="font-semibold text-royal-blue">
              security contact form
            </Link>
            .
          </p>
        </div>
      </section>

      <MarketingCtaBand />
    </MarketingShell>
  );
}
