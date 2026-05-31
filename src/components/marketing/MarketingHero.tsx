import Image from "next/image";
import { Landmark } from "lucide-react";
import { MotionReveal } from "@/components/home/MotionReveal";
import { ButtonLink } from "@/components/ui/Button";

type MarketingHeroProps = {
  eyebrow: string;
  headline: string;
  description: string;
  heroImage: string;
  heroImageAlt: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export function MarketingHero({
  eyebrow,
  headline,
  description,
  heroImage,
  heroImageAlt,
  primaryCta,
  secondaryCta,
}: MarketingHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-[#04101f] text-white">
      <div className="absolute inset-0 -z-10">
        <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(4,16,31,0.94)_0%,rgba(10,42,94,0.84)_45%,rgba(13,71,161,0.58)_100%)]" />
        <div className="banking-grid absolute inset-0 opacity-[0.16]" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="section-shell grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
        <MotionReveal>
          <div className="inline-flex items-center gap-2 rounded-sm border border-classic-gold/35 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-classic-gold-muted backdrop-blur-sm">
            <Landmark size={15} aria-hidden="true" />
            {eyebrow}
          </div>
          <h1 className="font-display mt-8 max-w-2xl text-4xl font-semibold leading-[1.06] sm:text-5xl lg:text-6xl">
            {headline}
          </h1>
          <div className="gold-rule mt-8 max-w-xl" aria-hidden="true" />
          <p className="mt-8 max-w-xl text-base leading-7 text-white/[0.82] sm:text-lg">
            {description}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={primaryCta.href} size="lg">
              {primaryCta.label}
            </ButtonLink>
            {secondaryCta ? (
              <ButtonLink
                href={secondaryCta.href}
                variant="secondary"
                size="lg"
                className="border-classic-gold/30 bg-black/20"
              >
                {secondaryCta.label}
              </ButtonLink>
            ) : null}
          </div>
        </MotionReveal>

        <MotionReveal delay={0.08} className="relative hidden lg:block">
          <div className="relative overflow-hidden rounded-sm border border-white/15 shadow-[0_32px_100px_rgba(0,0,0,0.45)]">
            <Image
              src={heroImage}
              alt={heroImageAlt}
              width={1400}
              height={933}
              className="h-[380px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#04101f]/70 via-transparent to-ocean-blue/10" />
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
