import Image from "next/image";
import { ArrowRight, Clock3, Landmark, Smartphone, Wrench } from "lucide-react";
import Link from "next/link";
import { MarketingCtaBand } from "@/components/marketing/MarketingCtaBand";
import { MarketingSectionHeader } from "@/components/marketing/MarketingSectionHeader";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MotionReveal } from "@/components/home/MotionReveal";
import { marketingImages, mobileAppFeatures } from "@/data/marketingPages";
import { ButtonLink } from "@/components/ui/Button";

export default function MobileAppPage() {
  return (
    <MarketingShell>
      <section className="relative isolate overflow-hidden bg-[#04101f] py-20 text-white sm:py-24">
        <div className="absolute inset-0 -z-10">
          <Image
            src={marketingImages.mobileHero}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(4,16,31,0.94)_0%,rgba(10,42,94,0.84)_45%,rgba(13,71,161,0.58)_100%)]" />
          <div className="banking-grid absolute inset-0 opacity-[0.16]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="section-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <MotionReveal>
            <div className="inline-flex items-center gap-2 rounded-sm border border-classic-gold/35 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-classic-gold-muted backdrop-blur-sm">
              <Smartphone size={15} aria-hidden="true" />
              Mobile app
            </div>
            <h1 className="font-display mt-8 max-w-3xl text-5xl font-semibold leading-[1.06] sm:text-6xl">
              Mobile layout preview for the Bluewave demo
            </h1>
            <div className="gold-rule mt-8 max-w-xl" aria-hidden="true" />
            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/[0.82]">
              The Bluewave mobile experience is in active development with biometric sign-in samples,
              card-control screens, and the same transfer flows shown in the web demo.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/auth/login" size="lg">
                Try demo sign-in
                <ArrowRight size={18} aria-hidden="true" />
              </ButtonLink>
              <ButtonLink
                href="/support"
                variant="secondary"
                size="lg"
                className="border-classic-gold/30 bg-black/20"
              >
                Contact Support
              </ButtonLink>
            </div>
          </MotionReveal>

          <MotionReveal delay={0.08} className="grid gap-5">
            <div className="relative overflow-hidden rounded-sm border border-white/15 shadow-[0_22px_80px_rgba(10,42,94,0.20)]">
              <Image
                src={marketingImages.mobileHero}
                alt="Bluewave mobile demo on a phone"
                width={1200}
                height={800}
                className="h-[260px] w-full object-cover sm:h-[320px]"
              />
            </div>

            <div className="rounded-sm border border-classic-gold/25 bg-white/[0.08] p-6 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <span className="marketing-icon-wrap !border-classic-gold/30 !bg-classic-gold/10 !text-classic-gold">
                  <Wrench size={23} aria-hidden="true" />
                </span>
                <span className="rounded-sm border border-classic-gold/30 px-3 py-1 text-xs font-semibold text-classic-gold">
                  In active development
                </span>
              </div>
              <h2 className="font-display mt-8 text-2xl font-semibold">Planned launch features</h2>
              <div className="gold-rule mt-4 max-w-xs" aria-hidden="true" />
              <div className="mt-6 grid gap-4">
                {mobileAppFeatures.map((item) => (
                  <div key={item} className="flex gap-3 rounded-sm bg-white/[0.08] p-4">
                    <Clock3 size={18} className="mt-0.5 shrink-0 text-classic-gold" aria-hidden="true" />
                    <p className="text-sm leading-6 text-white/[0.76]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="classic-marble py-16 sm:py-20">
        <div className="section-shell">
          <MotionReveal>
            <MarketingSectionHeader
              eyebrow="Early access"
              title="Join the waitlist through your demo profile"
              description="Existing demo users can sign in today while we finish the native app experience. New visitors can create a demo profile and opt in for launch updates."
            />
            <Link
              href="/auth/register"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-royal-blue hover:text-ocean-blue"
            >
              <Landmark size={16} aria-hidden="true" />
              Try the demo
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </MotionReveal>
        </div>
      </section>

      <MarketingCtaBand />
    </MarketingShell>
  );
}
