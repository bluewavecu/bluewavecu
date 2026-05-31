import Image from "next/image";
import { ArrowRight, Clock3, Smartphone, Sparkles, Wrench } from "lucide-react";
import Link from "next/link";
import { MarketingCtaBand } from "@/components/marketing/MarketingCtaBand";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MotionReveal } from "@/components/home/MotionReveal";
import { marketingImages, mobileAppFeatures } from "@/data/marketingPages";
import { ButtonLink } from "@/components/ui/Button";

export default function MobileAppPage() {
  return (
    <MarketingShell>
      <section className="relative isolate overflow-hidden bg-[#061222] py-20 text-white sm:py-24">
        <div className="banking-grid absolute inset-0 -z-10 opacity-[0.42]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="section-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <MotionReveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/[0.16] bg-white/[0.08] px-3 py-2 text-sm font-semibold text-light-blue backdrop-blur-xl">
              <Smartphone size={16} aria-hidden="true" />
              Mobile app
            </p>
            <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-tight sm:text-6xl">
              Mobile banking for Bluewave members
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/[0.74]">
              The Bluewave mobile app is in active development with biometric sign-in,
              card controls, and the same secure transfer workflows you use online.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/auth" size="lg">
                Use Online Banking
                <ArrowRight size={18} aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/support" variant="secondary" size="lg">
                Contact Support
              </ButtonLink>
            </div>
          </MotionReveal>

          <MotionReveal delay={0.08} className="grid gap-5">
            <div className="overflow-hidden rounded-lg border border-white/[0.16] shadow-[0_22px_80px_rgba(10,42,94,0.20)]">
              <Image
                src={marketingImages.mobileHero}
                alt="Bluewave mobile banking on a phone"
                width={1200}
                height={800}
                className="h-[260px] w-full object-cover sm:h-[320px]"
                priority
              />
            </div>

            <div className="rounded-lg border border-white/[0.16] bg-white/[0.08] p-6 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-light-blue/[0.16] text-light-blue">
                  <Wrench size={23} aria-hidden="true" />
                </span>
                <span className="rounded-full bg-white/[0.10] px-3 py-1 text-xs font-semibold text-light-blue">
                  In active development
                </span>
              </div>
              <h2 className="mt-8 text-2xl font-semibold">Planned launch features</h2>
              <div className="mt-6 grid gap-4">
                {mobileAppFeatures.map((item) => (
                  <div key={item} className="flex gap-3 rounded-lg bg-white/[0.08] p-4">
                    <Clock3 size={18} className="mt-0.5 shrink-0 text-light-blue" aria-hidden="true" />
                    <p className="text-sm leading-6 text-white/[0.72]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <div className="section-shell">
          <MotionReveal className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase text-ocean-blue">
              <Sparkles size={16} aria-hidden="true" />
              Early access
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-primary-navy">
              Join the waitlist through your Bluewave profile
            </h2>
            <p className="mt-4 text-base leading-7 text-bluewave-gray">
              Existing members can sign in today while we finish the native app experience.
              New members can open an account and opt in for launch updates.
            </p>
            <Link
              href="/register"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-royal-blue hover:text-ocean-blue"
            >
              Open an account
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </MotionReveal>
        </div>
      </section>

      <MarketingCtaBand />
    </MarketingShell>
  );
}
