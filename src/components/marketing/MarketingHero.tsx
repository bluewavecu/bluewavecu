import Image from "next/image";
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
    <section className="relative isolate overflow-hidden bg-[#061222] text-white">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,#061222_0%,#0A2A5E_48%,#0D47A1_100%)]" />
      <div className="banking-grid absolute inset-0 -z-10 opacity-[0.42]" />
      <div className="section-shell grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-24">
        <MotionReveal>
          <p className="text-sm font-semibold uppercase text-light-blue">{eyebrow}</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            {headline}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/[0.74] sm:text-lg">
            {description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={primaryCta.href} size="lg">
              {primaryCta.label}
            </ButtonLink>
            {secondaryCta ? (
              <ButtonLink href={secondaryCta.href} variant="secondary" size="lg">
                {secondaryCta.label}
              </ButtonLink>
            ) : null}
          </div>
        </MotionReveal>

        <MotionReveal delay={0.08} className="relative">
          <div className="overflow-hidden rounded-lg border border-white/[0.14] shadow-[0_28px_90px_rgba(10,42,94,0.28)]">
            <Image
              src={heroImage}
              alt={heroImageAlt}
              width={1400}
              height={933}
              priority
              className="h-[280px] w-full object-cover sm:h-[360px] lg:h-[420px]"
            />
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
