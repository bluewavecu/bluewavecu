import { ArrowRight, CircleHelp, Mail, MessageSquare, Phone } from "lucide-react";
import Link from "next/link";
import { MarketingCtaBand } from "@/components/marketing/MarketingCtaBand";
import { MarketingHero } from "@/components/marketing/MarketingHero";
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
        headline="Help that meets you where you manage your membership"
        description="Browse common answers, contact the Bluewave team, or sign in to create and track support requests from your member dashboard."
        heroImage={marketingImages.supportHero}
        heroImageAlt="Support specialist ready to help a member"
        primaryCta={{ label: "Contact support", href: "/contact" }}
        secondaryCta={{ label: "Sign in for ticket tracking", href: "/auth/login" }}
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
              <MotionReveal
                key={item.title}
                delay={index * 0.05}
                className="rounded-lg border border-primary-navy/[0.08] bg-white p-6 shadow-[0_18px_70px_rgba(10,42,94,0.08)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue">
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
          eyebrow: "Member-first support",
          title: "Real people for account questions and online banking help",
          description:
            "Whether you need help with transfers, cards, statements, or sign-in, Bluewave member services connects you to specialists who know your accounts.",
          bullets: [
            "Phone and email support during business hours",
            "Signed-in ticket tracking for members",
            "Escalation paths for urgent security concerns",
          ],
          image: marketingImages.supportSplit,
          imageAlt: "Member support representative assisting a credit union member",
        }}
      />

      <section className="bg-[linear-gradient(180deg,#f7fbff_0%,#edf7fd_100%)] py-16 sm:py-20">
        <div className="section-shell">
          <MotionReveal className="max-w-2xl">
            <p className="text-sm font-semibold uppercase text-ocean-blue">FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold text-primary-navy">Common questions</h2>
          </MotionReveal>

          <div className="mt-8 grid gap-4">
            {supportFaqs.map((item, index) => (
              <MotionReveal
                key={item.question}
                delay={index * 0.03}
                className="rounded-lg border border-primary-navy/[0.08] bg-white p-5"
              >
                <h3 className="flex items-start gap-3 font-semibold text-primary-navy">
                  <CircleHelp size={18} className="mt-0.5 shrink-0 text-ocean-blue" aria-hidden="true" />
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
