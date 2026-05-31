import Link from "next/link";
import { MarketingCtaBand } from "@/components/marketing/MarketingCtaBand";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { MarketingSectionHeader } from "@/components/marketing/MarketingSectionHeader";
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
        headline="Trust, visibility, and control in the demo"
        description="Bluewave shows how authentication, session monitoring, and sensitive-activity review could work in a member portal—all with sample data."
        heroImage={marketingImages.securityHero}
        heroImageAlt="Secure sign-in screen on a laptop"
        primaryCta={{ label: "Try demo sign-in", href: "/auth/login" }}
        secondaryCta={{ label: "Report a concern", href: "/contact?topic=security" }}
      />

      <section className="bg-background py-16 sm:py-20">
        <div className="section-shell grid gap-4 lg:grid-cols-2">
          {securityHighlights.map((item, index) => {
            const Icon = item.icon;

            return (
              <MotionReveal key={item.title} delay={index * 0.04} className="marketing-card">
                <span className="marketing-icon-wrap">
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
            "Bluewave combines authentication controls with monitoring for unusual transfers, bill payments, and account changes in the demonstration environment.",
          bullets: [
            "Optional MFA for additional sign-in protection",
            "Session list with revoke controls",
            "Extra review for high-value activity",
          ],
          image: marketingImages.securitySplit,
          imageAlt: "Secure sign-in verification on a laptop",
          reverse: true,
        }}
      />

      <section className="bg-background py-16 sm:py-20">
        <div className="section-shell">
          <MotionReveal>
            <MarketingSectionHeader
              eyebrow="Verify our website"
              title="Use only the official Bluewave demo address"
              description="Look-alike sites sometimes imitate financial demos to collect credentials. Confirm the address bar before entering a username or password."
            />
          </MotionReveal>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <MotionReveal delay={0.04} className="marketing-card">
              <h2 className="text-lg font-semibold text-primary-navy">Official URLs</h2>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-bluewave-gray">
                <li>
                  Demo sign-in:{" "}
                  <Link href="/auth/login" className="font-semibold text-royal-blue">
                    {INSTITUTION.officialDomain}/auth/login
                  </Link>
                </li>
                <li>
                  Public demo site:{" "}
                  <Link href="/" className="font-semibold text-royal-blue">
                    {INSTITUTION.officialDomain}
                  </Link>
                </li>
                <li>
                  Contact email:{" "}
                  <Link href={`mailto:${INSTITUTION.email}`} className="font-semibold text-royal-blue">
                    {INSTITUTION.email}
                  </Link>
                </li>
              </ul>
            </MotionReveal>
            <MotionReveal delay={0.08} className="marketing-card">
              <h2 className="text-lg font-semibold text-primary-navy">What this demo never does</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-bluewave-gray">
                <li>Offer real deposit accounts, loans, or insured financial products</li>
                <li>Ask for passwords, one-time codes, or full card numbers by email or text</li>
                <li>Send sign-in links that point to domains other than {INSTITUTION.officialDomain}</li>
              </ul>
              <p className="mt-4 text-sm leading-6 text-bluewave-gray">{INSTITUTION.publicDisclaimer}</p>
            </MotionReveal>
          </div>
        </div>
      </section>

      <section className="marketing-dark-band py-16 sm:py-20">
        <div className="section-shell grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <MotionReveal>
            <MarketingSectionHeader
              light
              eyebrow="Demo controls"
              title="Review devices, enable MFA, and revoke sessions"
              description="Signed-in demo users can manage active sessions and security preferences from the Security center."
            />
          </MotionReveal>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/auth/login" variant="light" size="lg">
              Sign in
            </ButtonLink>
            <ButtonLink
              href={MEMBER_SECURITY_PATH}
              variant="secondary"
              size="lg"
              className="border-classic-gold/30"
            >
              Security center
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="classic-marble py-10">
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
