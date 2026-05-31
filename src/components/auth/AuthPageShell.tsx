"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { AuthSiteTrustBar } from "@/components/auth/AuthSiteTrustBar";
import { LanguageSelector } from "@/components/i18n/LanguageSelector";
import { AuthLogo } from "@/components/layout/AuthLogo";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { useTranslation } from "@/i18n/LocaleProvider";
import { MEMBER_REGISTER_PATH } from "@/lib/authRoutes";
import { cn } from "@/lib/utils";

export type AuthPageVariant =
  | "memberLogin"
  | "adminLogin"
  | "register"
  | "forgotPassword"
  | "resetPassword"
  | "verifyEmail";

type AuthPageShellProps = {
  variant: AuthPageVariant;
  wide?: boolean;
  children: ReactNode;
};

function getVariantPrefix(variant: AuthPageVariant) {
  if (variant === "memberLogin") {
    return "auth.memberLogin";
  }

  if (variant === "adminLogin") {
    return "auth.adminLogin";
  }

  if (variant === "register") {
    return "auth.register";
  }

  if (variant === "forgotPassword") {
    return "auth.forgotPassword";
  }

  if (variant === "resetPassword") {
    return "auth.resetPassword";
  }

  return "auth.verifyEmail";
}

export function AuthPageShell({ variant, wide = false, children }: AuthPageShellProps) {
  const { t } = useTranslation();
  const prefix = getVariantPrefix(variant);
  const showAlternate = variant === "memberLogin" || variant === "register";

  return (
    <main className="min-h-screen bg-[#faf8f4] dark:bg-[#061222]">
      <div className="grid lg:min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <section className="relative hidden overflow-hidden bg-[#04101f] p-10 text-white lg:flex lg:flex-col">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#04101f_0%,#0A2A5E_50%,#0D47A1_100%)]" />
          <div className="banking-grid absolute inset-0 opacity-[0.22]" />
          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-center justify-between gap-4">
              <BrandLogo displayHeight={40} priority />
              <LanguageSelector
                className="text-white"
                selectClassName="border-white/[0.16] bg-white/[0.08] text-white"
              />
            </div>

            <div className="my-auto max-w-lg py-10">
              <p className="inline-flex items-center gap-2 rounded-sm border border-classic-gold/35 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-classic-gold-muted">
                <ShieldCheck size={15} aria-hidden="true" />
                {t(`${prefix}.marketingBadge`)}
              </p>
              <h1 className="font-display mt-8 text-4xl font-semibold leading-[1.06] xl:text-5xl">
                {t(`${prefix}.marketingHeadline`)}
              </h1>
              <div className="gold-rule mt-6 max-w-xs" aria-hidden="true" />
              <p className="mt-6 text-base leading-7 text-white/[0.78]">{t(`${prefix}.marketingBody`)}</p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-sm border border-classic-gold/25 bg-white/[0.08] p-4 backdrop-blur-sm">
                  <ShieldCheck size={18} className="text-classic-gold" aria-hidden="true" />
                  <p className="mt-2 text-sm font-semibold">{t(`${prefix}.marketingHighlight1`)}</p>
                </div>
                <div className="rounded-sm border border-classic-gold/25 bg-white/[0.08] p-4 backdrop-blur-sm">
                  <ShieldCheck size={18} className="text-classic-gold" aria-hidden="true" />
                  <p className="mt-2 text-sm font-semibold">{t(`${prefix}.marketingHighlight2`)}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="classic-marble flex flex-col px-4 py-6 sm:px-6 sm:py-8 lg:min-h-screen lg:py-10">
          <div
            className={cn(
              "mx-auto w-full lg:flex lg:flex-1 lg:flex-col",
              wide ? "max-w-5xl" : "max-w-md",
            )}
          >
            <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6 lg:mb-8">
              <AuthLogo priority />
              <LanguageSelector className="lg:hidden" />
            </div>

            <div
              className={cn(
                "marketing-panel border-classic-gold/20 dark:border-white/[0.08] dark:bg-[#0a1a2e]",
                wide && "lg:flex lg:min-h-0 lg:flex-1 lg:flex-col",
              )}
            >
              <div className="border-b border-classic-gold/20 px-5 py-4 dark:border-white/[0.06] sm:px-8 sm:py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ocean-blue sm:text-sm">
                  {t(`${prefix}.eyebrow`)}
                </p>
                <h2 className="font-display mt-2 text-xl font-semibold text-primary-navy dark:text-white sm:text-2xl lg:text-3xl">
                  {t(`${prefix}.title`)}
                </h2>
                <div className="gold-rule mt-4 max-w-[8rem]" aria-hidden="true" />
                <p className="mt-1 text-sm leading-5 text-bluewave-gray dark:text-white/[0.62] sm:mt-2 sm:leading-6">
                  {t(`${prefix}.description`)}
                </p>
              </div>

              <div
                className={cn(
                  "px-5 py-5 sm:px-8 sm:py-7",
                  wide && "lg:flex-1 lg:overflow-y-auto lg:overscroll-contain",
                )}
              >
                <AuthSiteTrustBar />
                {children}
              </div>

              {showAlternate ? (
                <div className="border-t border-classic-gold/20 px-6 py-4 text-center text-sm text-bluewave-gray dark:border-white/[0.06] dark:text-white/[0.62] sm:px-8">
                  {t(`${prefix}.alternatePrompt`)}{" "}
                  <Link
                    href={variant === "memberLogin" ? MEMBER_REGISTER_PATH : "/auth/login"}
                    className="font-semibold text-royal-blue hover:text-ocean-blue dark:text-light-blue"
                  >
                    {t(`${prefix}.alternateLabel`)}
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
