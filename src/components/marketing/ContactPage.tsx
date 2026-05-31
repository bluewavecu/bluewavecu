import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { ContactFormClient } from "@/components/marketing/ContactFormClient";
import { MarketingCtaBand } from "@/components/marketing/MarketingCtaBand";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MotionReveal } from "@/components/home/MotionReveal";
import { marketingImages } from "@/data/marketingPages";
import {
  INSTITUTION,
  formatInstitutionAddress,
} from "@/lib/institution";

type ContactPageProps = {
  defaultTopic?: string;
  defaultMessage?: string;
};

const contactChannels = [
  {
    icon: MapPin,
    label: formatInstitutionAddress(),
    href: undefined,
  },
  {
    icon: Phone,
    label: `${INSTITUTION.phone.display} · ${INSTITUTION.memberServicesHoursShort}`,
    href: `tel:${INSTITUTION.phone.tel}`,
  },
  {
    icon: Mail,
    label: INSTITUTION.email,
    href: `mailto:${INSTITUTION.email}`,
  },
] as const;

export function ContactPage({ defaultTopic, defaultMessage }: ContactPageProps) {
  return (
    <MarketingShell>
      <MarketingHero
        eyebrow="Contact"
        headline="We are here for members and future members"
        description="Reach the Bluewave team for product questions, support, lending inquiries, careers, or security concerns."
        heroImage={marketingImages.contactHero}
        heroImageAlt="Member reaching out to support"
        primaryCta={{ label: "Send a message", href: "#contact-form" }}
        secondaryCta={{ label: "Browse support FAQ", href: "/support" }}
      />

      <section id="contact-form" className="bg-background py-16 sm:py-20">
        <div className="section-shell grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <MotionReveal className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase text-ocean-blue">Visit or call</p>
              <h2 className="mt-3 text-3xl font-semibold text-primary-navy">Member support channels</h2>
              <p className="mt-3 text-sm leading-6 text-bluewave-gray">
                Member services: {INSTITUTION.memberServicesHours}
              </p>
            </div>

            <div className="grid gap-4">
              {contactChannels.map((item) => {
                const Icon = item.icon;
                const content = (
                  <>
                    <Icon size={18} className="text-ocean-blue" aria-hidden="true" />
                    <span className="text-sm text-primary-navy">{item.label}</span>
                  </>
                );

                return item.href ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg border border-primary-navy/[0.08] bg-white p-4 transition hover:border-ocean-blue/[0.30]"
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-lg border border-primary-navy/[0.08] bg-white p-4"
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          </MotionReveal>

          <MotionReveal delay={0.06}>
            <ContactFormClient defaultTopic={defaultTopic} defaultMessage={defaultMessage} />
          </MotionReveal>
        </div>
      </section>

      <MarketingCtaBand />
    </MarketingShell>
  );
}
