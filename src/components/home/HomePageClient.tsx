"use client";

import {
  ArrowRight,
  CheckCircle2,
  Landmark,
  LogIn,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { MotionReveal } from "@/components/home/MotionReveal";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { MarketingCtaBand } from "@/components/marketing/MarketingCtaBand";
import { ButtonLink } from "@/components/ui/Button";
import {
  features,
  heritageBlock,
  homeImages,
  products,
  safetyHighlights,
  securityPoints,
  stats,
} from "@/data/home";
import { useTranslation } from "@/i18n/LocaleProvider";
import { SiteTrustNotice } from "@/components/layout/SiteTrustNotice";
import { MEMBER_LOGIN_PATH, MEMBER_REGISTER_PATH } from "@/lib/authRoutes";

const trustBadges = [
  { key: "marketing.home.trustMemberOwned", icon: Landmark },
  { key: "marketing.home.trustNcua", icon: ShieldCheck },
  { key: "marketing.home.trustLocal", icon: Landmark },
  { key: "marketing.home.trustEstablished", icon: Landmark },
] as const;

const heritageBullets = [
  "marketing.home.heritageBullet1",
  "marketing.home.heritageBullet2",
  "marketing.home.heritageBullet3",
] as const;

function productHref(title: string) {
  if (title === "Personal Banking") return "/personal";
  if (title === "Business Banking") return "/business";
  return "/loans";
}

export function HomePageClient() {
  const { t } = useTranslation();

  const localizedStats = useMemo(
    () =>
      stats.map((stat, index) => {
        const labelKeys = [
          "marketing.home.statsDigitalAccess",
          "marketing.home.statsPaymentMovement",
          "marketing.home.statsAccountControls",
          "marketing.home.statsMobileExperience",
        ] as const;

        return {
          value: stat.value,
          label: t(labelKeys[index] ?? stat.label),
        };
      }),
    [t],
  );

  return (
    <main className="overflow-hidden">
      <Navbar />

      <section className="relative isolate min-h-[82svh] overflow-hidden bg-[#04101f] text-white">
        <div className="absolute inset-0 -z-10">
          <Image
            src={homeImages.hero}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(4,16,31,0.94)_0%,rgba(10,42,94,0.82)_42%,rgba(13,71,161,0.55)_100%)]" />
          <div className="banking-grid absolute inset-0 opacity-[0.18]" />
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#f4f1ea] to-transparent" />
        </div>

        <div className="section-shell relative z-10 grid gap-12 pb-20 pt-16 sm:pb-24 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-28">
          <MotionReveal className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-sm border border-classic-gold/35 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-classic-gold-muted backdrop-blur-sm">
              <Landmark size={15} aria-hidden="true" />
              {t("marketing.home.badge")}
            </div>

            <h1 className="font-display mt-8 max-w-3xl text-5xl font-semibold leading-[1.05] text-white sm:text-6xl lg:text-[4.25rem]">
              {t("marketing.home.headline")}
            </h1>

            <div className="gold-rule mt-8 max-w-xl" aria-hidden="true" />

            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/[0.82] sm:text-xl">
              {t("marketing.home.description")}
            </p>

            <SiteTrustNotice variant="marketing" className="mt-8 max-w-2xl" />

            <div className="mt-8 flex flex-col gap-3 sm:max-w-md sm:flex-row">
              <ButtonLink href={MEMBER_REGISTER_PATH} size="lg" className="w-full justify-center sm:flex-1">
                {t("marketing.home.primaryCta")}
                <ArrowRight size={18} aria-hidden="true" />
              </ButtonLink>
              <ButtonLink
                href={MEMBER_LOGIN_PATH}
                variant="secondary"
                size="lg"
                className="w-full justify-center border-classic-gold/30 bg-black/20 sm:flex-1"
              >
                {t("marketing.home.loginToOnlineBanking")}
                <LogIn size={18} aria-hidden="true" />
              </ButtonLink>
            </div>
          </MotionReveal>

          <MotionReveal delay={0.1} className="relative hidden lg:block">
            <div className="relative overflow-hidden rounded-sm border border-white/15 shadow-[0_32px_100px_rgba(0,0,0,0.45)]">
              <Image
                src={homeImages.heritage}
                alt={heritageBlock.imageAlt}
                width={1200}
                height={900}
                className="h-[420px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#04101f]/80 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-5 -left-5 rounded-sm border border-classic-gold/35 bg-primary-navy/95 px-5 py-4 shadow-[0_20px_60px_rgba(10,42,94,0.35)] backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-classic-gold">
                {t("marketing.home.trustMemberOwned")}
              </p>
              <p className="mt-1 font-display text-2xl text-white">{t("marketing.home.trustLocal")}</p>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="classic-marble border-y border-classic-gold/20 py-5" aria-label="Institutional trust markers">
        <div className="section-shell">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustBadges.map(({ key, icon: Icon }) => (
              <div
                key={key}
                className="flex items-center gap-3 rounded-sm border border-primary-navy/10 bg-white/70 px-4 py-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary-navy text-classic-gold">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-primary-navy">{t(key)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-12 sm:py-14" aria-labelledby="trusted-stats">
        <div className="section-shell">
          <div className="grid gap-4 rounded-sm border border-primary-navy/10 bg-white p-4 shadow-[0_18px_70px_rgba(10,42,94,0.08)] sm:grid-cols-2 lg:grid-cols-4">
            <h2 id="trusted-stats" className="sr-only">
              {t("marketing.home.featuresTitle")}
            </h2>
            {localizedStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-sm border border-classic-gold/25 bg-gradient-to-br from-white to-classic-gold-muted/20 p-5"
              >
                <p className="font-display text-3xl font-semibold text-primary-navy">{stat.value}</p>
                <p className="mt-2 text-sm font-medium text-bluewave-gray">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="classic-marble py-16 sm:py-20">
        <div className="section-shell">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <MotionReveal className="relative order-2 lg:order-1">
              <div className="overflow-hidden rounded-sm border border-primary-navy/10 shadow-[0_24px_80px_rgba(10,42,94,0.14)]">
                <Image
                  src={heritageBlock.image}
                  alt={heritageBlock.imageAlt}
                  width={1200}
                  height={800}
                  className="h-[300px] w-full object-cover sm:h-[380px]"
                />
              </div>
              <div className="absolute -bottom-4 right-4 hidden rounded-sm border border-classic-gold/30 bg-white px-4 py-3 shadow-lg sm:block">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-classic-gold">
                  {t("marketing.home.heritageEyebrow")}
                </p>
                <p className="mt-1 text-sm font-semibold text-primary-navy">
                  {t("marketing.home.trustMemberOwned")}
                </p>
              </div>
            </MotionReveal>

            <MotionReveal delay={0.06} className="order-1 lg:order-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ocean-blue">
                {t("marketing.home.heritageEyebrow")}
              </p>
              <h2 className="font-display mt-4 text-3xl font-semibold text-primary-navy sm:text-4xl">
                {t("marketing.home.heritageTitle")}
              </h2>
              <div className="gold-rule mt-6 max-w-xs" aria-hidden="true" />
              <p className="mt-6 text-base leading-7 text-bluewave-gray">
                {t("marketing.home.heritageDescription")}
              </p>
              <ul className="mt-8 space-y-3">
                {heritageBullets.map((bulletKey) => (
                  <li key={bulletKey} className="flex gap-3 text-sm leading-6 text-primary-navy">
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-classic-gold"
                      aria-hidden="true"
                    />
                    {t(bulletKey)}
                  </li>
                ))}
              </ul>
            </MotionReveal>
          </div>
        </div>
      </section>

      <section id="features" className="bg-background py-16 sm:py-20">
        <div className="section-shell">
          <MotionReveal className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ocean-blue">
              {t("nav.personal")}
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold text-primary-navy sm:text-4xl">
              {t("marketing.home.featuresTitle")}
            </h2>
            <div className="gold-rule mt-6 max-w-xs" aria-hidden="true" />
          </MotionReveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <MotionReveal
                  key={feature.title}
                  delay={index * 0.04}
                  className="rounded-sm border border-primary-navy/10 bg-white p-6 shadow-[0_16px_60px_rgba(10,42,94,0.06)] transition hover:-translate-y-1 hover:border-classic-gold/40"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-sm border border-classic-gold/25 bg-classic-gold-muted/30 text-primary-navy">
                    <Icon size={23} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-primary-navy">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-bluewave-gray">{feature.description}</p>
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
          <MotionReveal className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ocean-blue">
              {t("nav.business")}
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold text-primary-navy sm:text-4xl">
              {t("marketing.home.productsTitle")}
            </h2>
            <div className="gold-rule mt-6 max-w-xs" aria-hidden="true" />
          </MotionReveal>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {products.map((product, index) => (
              <MotionReveal
                key={product.title}
                delay={index * 0.06}
                className="group overflow-hidden rounded-sm border border-primary-navy/10 bg-white shadow-[0_20px_70px_rgba(10,42,94,0.08)]"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${product.accent} opacity-55`} />
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-classic-gold/80" />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold text-primary-navy">{product.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-bluewave-gray">{product.description}</p>
                  <Link
                    href={productHref(product.title)}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-royal-blue transition hover:text-ocean-blue"
                  >
                    {t("marketing.home.learnMore")}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="relative isolate overflow-hidden bg-primary-navy py-16 text-white sm:py-20">
        <div className="absolute inset-0 -z-10 opacity-20">
          <Image src={homeImages.security} alt="" fill sizes="100vw" className="object-cover" />
        </div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(10,42,94,0.96)_0%,rgba(6,18,34,0.92)_100%)]" />

        <div className="section-shell grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <MotionReveal>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-classic-gold">
              {t("footer.security")}
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">
              {t("marketing.home.securityTitle")}
            </h2>
            <div className="gold-rule mt-6 max-w-xs" aria-hidden="true" />
            <ul className="mt-8 space-y-3">
              {safetyHighlights.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-white/[0.78]">
                  <CheckCircle2 size={16} className="text-classic-gold" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </MotionReveal>

          <div className="grid gap-4">
            {securityPoints.map((point, index) => {
              const Icon = point.icon;

              return (
                <MotionReveal
                  key={point.title}
                  delay={index * 0.06}
                  className="rounded-sm border border-classic-gold/20 bg-white/[0.07] p-5 backdrop-blur-sm"
                >
                  <div className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-classic-gold/25 bg-classic-gold/10 text-classic-gold">
                      <Icon size={21} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-white">{point.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/[0.68]">{point.description}</p>
                    </div>
                  </div>
                </MotionReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="open-account">
        <MarketingCtaBand />
      </section>

      <TestimonialsCarousel />

      <Footer />
    </main>
  );
}
