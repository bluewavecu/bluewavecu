"use client";

import { ArrowRight, Fingerprint } from "lucide-react";
import { MotionReveal } from "@/components/home/MotionReveal";
import { ButtonLink } from "@/components/ui/Button";
import { useTranslation } from "@/i18n/LocaleProvider";

export function MarketingCtaBand() {
  const { t } = useTranslation();

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="section-shell">
        <MotionReveal className="overflow-hidden rounded-lg bg-[linear-gradient(120deg,#0A2A5E,#0D47A1_56%,#00A8E8)] p-6 text-white shadow-[0_28px_90px_rgba(10,42,94,0.22)] sm:p-10 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase text-light-blue">{t("nav.openAccount")}</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">
                {t("marketing.ctaHeadline")}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/[0.72]">
                {t("marketing.ctaBody")}
              </p>
            </div>
            <div className="flex w-full flex-col gap-4 lg:min-w-[300px]">
              <div className="rounded-lg border border-white/[0.24] bg-white p-5 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
                <p className="text-sm font-semibold uppercase tracking-wide text-ocean-blue">
                  {t("nav.openAccount")}
                </p>
                <p className="mt-2 text-lg font-semibold text-primary-navy">{t("marketing.ctaPrimary")}</p>
                <ButtonLink
                  href="/auth/register"
                  variant="primary"
                  size="lg"
                  className="mt-5 w-full justify-center shadow-[0_20px_50px_rgba(0,168,232,0.35)]"
                >
                  {t("marketing.ctaPrimary")}
                  <ArrowRight size={18} aria-hidden="true" />
                </ButtonLink>
              </div>
              <ButtonLink href="/auth/login" variant="secondary" size="lg" className="w-full justify-center">
                {t("marketing.ctaSecondary")}
                <Fingerprint size={18} aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
