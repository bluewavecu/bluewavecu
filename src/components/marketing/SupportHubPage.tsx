import { ArrowRight, CircleHelp, Mail, MessageSquare, Phone } from "lucide-react";
import Link from "next/link";
import { MarketingCtaBand } from "@/components/marketing/MarketingCtaBand";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { MarketingSectionHeader } from "@/components/marketing/MarketingSectionHeader";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MarketingSplitSection } from "@/components/marketing/MarketingSplitSection";
import { MotionReveal } from "@/components/home/MotionReveal";
import { supportFaqs, marketingImages } from "@/data/marketingPages";
import { INSTITUTION } from "@/lib/institution";
import { ButtonLink } from "@/components/ui/Button";

export function SupportHubPage() {
  return (
    <MarketingShell>
      <MarketingHero
        eyebrow="Support"
        headline="Help for exploring the Bluewave demo"
        description="Browse common answers, contact the team, or sign in to create and track sample support requests from the demo dashboard."
        heroImage={marketingImages.supportHero}
        heroImageAlt="Support specialist ready to help a demo user"
        primaryCta={{ label: "Contact the team", href: "/contact" }}
        secondaryCta={{ label: "Demo sign-in for tickets", href: "/auth/login" }}
      />

      <section className="bg-background py-16 sm:py-20">
        <div className="section-shell grid gap-5 lg:grid-cols-3">
          {[
            {
              icon: MessageSquare,
              title: "Submit a ticket",
              text: "Signed-in members can create and track support requests online.",
              href: "/auth/login",
            },
            {
              icon: Phone,
              title: "Call us",
              text: `${INSTITUTION.phone.display} · ${INSTITUTION.memberServicesHoursShort}`,
              href: `tel:${INSTITUTION.phone.tel}`,
            },
            {
              icon: Mail,
              title: "Email",
              text: `${INSTITUTION.email} for non-urgent questions.`,
              href: `mailto:${INSTITUTION.email}`,
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <MotionReveal key={item.title} delay={index * 0.05} className="marketing-card">
                <span className="marketing-icon-wrap">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-lg font-semibold text-primary-navy">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-bluewave-gray">{item.text}</p>
                <Link
                  href={item.href}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-royal-blue hover:text-ocean-blue"
                >
                  Continue
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </MotionReveal>
            );
          })}
        </div>
      </section>

      <MarketingSplitSection
        block={{
          eyebrow: "Demo support",
          title: "Real people for questions about the interface",
          description:
            "Whether you need help with demo transfers, cards, statements, or sign-in, the Bluewave team can walk you through the sample environment.",
          bullets: [
            "Phone and email contact during business hours",
            "Signed-in ticket tracking in the demo",
            "Escalation paths for urgent security concerns",
          ],
          image: marketingImages.supportSplit,
          imageAlt: "Support representative assisting a demo user",
        }}
      />

      <section className="bg-[linear-gradient(180deg,#f7fbff_0%,#edf7fd_100%)] py-16 sm:py-20">
        <div className="section-shell">
          <MotionReveal>
            <MarketingSectionHeader eyebrow="FAQ" title="Common questions" />
          </MotionReveal>

          <div className="mt-8 grid gap-4">
            {supportFaqs.map((item, index) => (
              <MotionReveal key={item.question} delay={index * 0.03} className="marketing-card">
                <h3 className="flex items-start gap-3 font-semibold text-primary-navy">
                  <CircleHelp size={18} className="mt-0.5 shrink-0 text-classic-gold" aria-hidden="true" />
                  {item.question}
                </h3>
                <p className="mt-3 text-sm leading-6 text-bluewave-gray">{item.answer}</p>
              </MotionReveal>
            ))}
          </div>

          <div className="mt-8">
            <ButtonLink href="/contact" size="lg">
              Still need help? Contact us
            </ButtonLink>
          </div>
        </div>
      </section>

      <MarketingCtaBand />
    </MarketingShell>
  );
}
