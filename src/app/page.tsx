import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock3,
  Fingerprint,
  LogIn,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { MotionReveal } from "@/components/home/MotionReveal";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { ButtonLink } from "@/components/ui/Button";
import {
  features,
  products,
  safetyHighlights,
  securityPoints,
  stats,
} from "@/data/home";

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Navbar />
      <section className="relative isolate min-h-[76svh] overflow-hidden bg-[#061222] text-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,#061222_0%,#0A2A5E_48%,#0D47A1_100%)]" />
          <div className="banking-grid absolute inset-0 opacity-[0.55]" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.08] to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f7fbff] to-transparent" />

          <div className="absolute left-1/2 top-24 hidden w-[760px] -translate-x-[8%] lg:block">
            <div className="grid grid-cols-[1.05fr_0.95fr] gap-5 opacity-90">
              <div className="glass-card p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-white/[0.62]">
                    Available balance
                  </span>
                  <WalletCards size={18} className="text-light-blue" aria-hidden="true" />
                </div>
                <div className="mt-5 h-8 w-44 rounded-lg bg-white/[0.20]" />
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="h-20 rounded-lg bg-white/[0.10]" />
                  <div className="h-20 rounded-lg bg-ocean-blue/[0.28]" />
                  <div className="h-20 rounded-lg bg-light-blue/[0.20]" />
                </div>
              </div>
              <div className="glass-card p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-white/[0.62]">
                    Card controls
                  </span>
                  <Fingerprint size={18} className="text-light-blue" aria-hidden="true" />
                </div>
                <div className="mt-6 space-y-3">
                  <div className="h-3 w-11/12 rounded-full bg-white/[0.20]" />
                  <div className="h-3 w-8/12 rounded-full bg-white/[0.14]" />
                  <div className="h-3 w-10/12 rounded-full bg-ocean-blue/[0.35]" />
                </div>
                <div className="mt-8 h-20 overflow-hidden rounded-lg border border-white/[0.12] bg-white/[0.08]">
                  <div className="flow-line mt-9 h-1 w-2/3 bg-gradient-to-r from-transparent via-light-blue to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="section-shell relative z-10 grid gap-12 pb-16 pt-14 sm:pb-20 sm:pt-20 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:pt-24">
          <MotionReveal className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.18] bg-white/[0.08] px-3 py-2 text-sm font-semibold text-light-blue backdrop-blur-xl">
              <Sparkles size={16} aria-hidden="true" />
              Digital banking for members
            </div>
            <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
              Member-owned banking built around you
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/[0.76] sm:text-xl">
              Secure online banking with competitive rates, local service, and tools to manage
              everyday finances as a Bluewave member.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#open-account" size="lg">
                Open Account
                <ArrowRight size={18} aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="#features" variant="secondary" size="lg">
                Learn More
                <BadgeCheck size={18} aria-hidden="true" />
              </ButtonLink>
            </div>
          </MotionReveal>

          <MotionReveal
            delay={0.12}
            className="grid gap-4 sm:grid-cols-2 lg:justify-self-end"
          >
            <div className="glass-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white/[0.74]">
                  Payment velocity
                </span>
                <Clock3 size={18} className="text-light-blue" aria-hidden="true" />
              </div>
              <div className="mt-8 flex items-end gap-2">
                <span className="text-4xl font-semibold">Fast</span>
                <span className="pb-1 text-sm text-white/[0.58]">member transfers</span>
              </div>
            </div>
            <div className="glass-card p-5 sm:translate-y-8">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white/[0.74]">
                  Safety posture
                </span>
                <ShieldCheck size={18} className="text-light-blue" aria-hidden="true" />
              </div>
              <div className="mt-7 space-y-3">
                {safetyHighlights.map((item) => (
                  <span key={item} className="flex items-center gap-2 text-sm text-white/[0.72]">
                    <CheckCircle2 size={16} className="text-light-blue" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="bg-background py-12 sm:py-14" aria-labelledby="trusted-stats">
        <div className="section-shell">
          <div className="grid gap-4 rounded-lg border border-primary-navy/[0.08] bg-white p-4 shadow-[0_18px_70px_rgba(10,42,94,0.08)] sm:grid-cols-2 lg:grid-cols-4">
            <h2 id="trusted-stats" className="sr-only">
              Member benefits at a glance
            </h2>
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-primary-navy/[0.07] bg-gradient-to-br from-white to-light-blue/[0.10] p-5"
              >
                <p className="text-3xl font-semibold text-primary-navy">{stat.value}</p>
                <p className="mt-2 text-sm font-medium text-bluewave-gray">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-background py-16 sm:py-20">
        <div className="section-shell">
          <MotionReveal className="max-w-2xl">
            <p className="text-sm font-semibold uppercase text-ocean-blue">Feature cards</p>
            <h2 className="mt-3 text-3xl font-semibold text-primary-navy sm:text-4xl">
              Everyday money tools for members
            </h2>
          </MotionReveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <MotionReveal
                  key={feature.title}
                  delay={index * 0.04}
                  className="rounded-lg border border-primary-navy/[0.08] bg-white/[0.82] p-6 shadow-[0_16px_60px_rgba(10,42,94,0.08)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-ocean-blue/[0.38]"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue">
                    <Icon size={23} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-primary-navy">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-bluewave-gray">
                    {feature.description}
                  </p>
                </MotionReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="products"
        className="bg-[linear-gradient(180deg,#f7fbff_0%,#edf7fd_100%)] py-16 sm:py-20"
      >
        <div className="section-shell">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <MotionReveal>
              <p className="text-sm font-semibold uppercase text-ocean-blue">
                Banking products
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-primary-navy sm:text-4xl">
                Built for personal goals, business growth, and member lending
              </h2>
            </MotionReveal>
            <MotionReveal delay={0.08}>
              <p className="max-w-2xl text-base leading-7 text-bluewave-gray lg:ml-auto">
                Share draft, share savings, business accounts, and lending — backed by NCUA
                insurance and
                member-focused digital service.
              </p>
            </MotionReveal>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {products.map((product, index) => (
              <MotionReveal
                key={product.title}
                delay={index * 0.06}
                className="group overflow-hidden rounded-lg border border-primary-navy/[0.08] bg-white shadow-[0_20px_70px_rgba(10,42,94,0.08)]"
              >
                <div className={`h-2 bg-gradient-to-r ${product.accent}`} />
                <div className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-navy text-white transition group-hover:bg-royal-blue">
                    <BarChart3 size={22} aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-primary-navy">
                    {product.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-bluewave-gray">
                    {product.description}
                  </p>
                  <Link
                    href={
                      product.title === "Personal Banking"
                        ? "/personal"
                        : product.title === "Business Banking"
                          ? "/business"
                          : "/loans"
                    }
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-royal-blue transition hover:text-ocean-blue"
                  >
                    Explore
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="bg-primary-navy py-16 text-white sm:py-20">
        <div className="section-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <MotionReveal>
            <p className="text-sm font-semibold uppercase text-light-blue">Security</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Secure finances for everyday membership
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/[0.70]">
              Member deposits are NCUA insured. Online banking uses encrypted sessions, review
              queues for money movement, and audit logging for sensitive actions.
            </p>
          </MotionReveal>

          <div className="grid gap-4">
            {securityPoints.map((point, index) => {
              const Icon = point.icon;

              return (
                <MotionReveal
                  key={point.title}
                  delay={index * 0.06}
                  className="rounded-lg border border-white/[0.12] bg-white/[0.08] p-5 backdrop-blur-xl"
                >
                  <div className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-light-blue/[0.16] text-light-blue">
                      <Icon size={21} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-white">{point.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/[0.66]">
                        {point.description}
                      </p>
                    </div>
                  </div>
                </MotionReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="open-account" className="bg-background py-16 sm:py-20">
        <div className="section-shell">
          <MotionReveal className="overflow-hidden rounded-lg bg-[linear-gradient(120deg,#0A2A5E,#0D47A1_56%,#00A8E8)] p-6 text-white shadow-[0_28px_90px_rgba(10,42,94,0.22)] sm:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase text-light-blue">Get started</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">
                  Open a digital-first membership with Bluewave.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/[0.72]">
                  A focused onboarding path for new members with online banking, transfers, bill
                  pay, and dedicated member support.
                </p>
              </div>
              <div className="flex w-full flex-col gap-4 lg:min-w-[280px]">
                <div className="rounded-lg border border-white/[0.18] bg-white/[0.08] p-4 backdrop-blur-xl">
                  <p className="text-sm font-semibold text-white">Already a member?</p>
                  <p className="mt-1 text-sm leading-6 text-white/[0.72]">
                    Sign in to online banking to view accounts, transfers, and statements.
                  </p>
                  <ButtonLink
                    href="/auth"
                    variant="primary"
                    size="lg"
                    className="mt-4 w-full justify-center shadow-[0_20px_50px_rgba(0,168,232,0.35)]"
                  >
                    <LogIn size={18} aria-hidden="true" />
                    Sign in to online banking
                  </ButtonLink>
                </div>
                <ButtonLink
                  href="/register"
                  variant="light"
                  size="lg"
                  className="w-full justify-center"
                >
                  Open Account
                  <ArrowRight size={18} aria-hidden="true" />
                </ButtonLink>
              </div>
            </div>
          </MotionReveal>
        </div>
      </section>

      <TestimonialsCarousel />

      <Footer />
    </main>
  );
}
