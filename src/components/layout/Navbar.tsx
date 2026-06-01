"use client";

import { LogIn, Menu, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { LanguageSelector } from "@/components/i18n/LanguageSelector";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { buttonVariants } from "@/components/ui/Button";
import { useTranslation } from "@/i18n/LocaleProvider";
import { MEMBER_LOGIN_PATH, MEMBER_REGISTER_PATH } from "@/lib/authRoutes";
const navLinkKeys = [
  { labelKey: "nav.personal", href: "/personal" },
  { labelKey: "nav.business", href: "/business" },
  { labelKey: "nav.savings", href: "/savings" },
  { labelKey: "nav.loans", href: "/loans" },
  { labelKey: "nav.rates", href: "/rates" },
  { labelKey: "nav.about", href: "/about" },
  { labelKey: "nav.security", href: "/security" },
  { labelKey: "nav.support", href: "/support" },
  { labelKey: "nav.mobileApp", href: "/mobile-app" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-[60] isolate border-b border-white/10 bg-brand-navy text-white shadow-[0_12px_40px_rgba(20,35,60,0.22)]">
      <nav
        aria-label="Main navigation"
        className="section-shell flex h-[4.5rem] items-center justify-between gap-3 sm:gap-4 lg:h-20 lg:gap-6"
      >
        <BrandLogo priority displayHeight={44} onClick={() => setOpen(false)} />

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-4 xl:gap-6 lg:flex">
          {navLinkKeys.map((link) => (
            <Link
              key={link.labelKey}
              href={link.href}
              className="text-sm font-medium text-white/[0.82] transition hover:text-light-blue"
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <LanguageSelector
            compact
            className="text-white"
            selectClassName="h-9 border-white/[0.16] bg-white/[0.08] text-white sm:h-10"
          />

          <Link
            href={MEMBER_LOGIN_PATH}
            className={buttonVariants({
              variant: "secondary",
              size: "sm",
              className:
                "hidden h-9 border-white/[0.18] bg-white/[0.08] px-3.5 text-xs text-white sm:inline-flex sm:h-10 sm:px-4 sm:text-sm",
            })}
          >
            <LogIn size={16} aria-hidden="true" />
            {t("marketing.home.loginToOnlineBanking")}
          </Link>

          <Link
            href={MEMBER_REGISTER_PATH}
            className={buttonVariants({
              variant: "primary",
              size: "sm",
              className: "hidden h-9 px-3.5 text-xs sm:inline-flex sm:h-10 sm:px-4 sm:text-sm",
            })}
          >
            <UserPlus size={16} aria-hidden="true" />
            {t("nav.openAccount")}
          </Link>

          <button
            type="button"
            aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/30 bg-white/12 text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition hover:bg-white/20 lg:hidden"
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-white/15 bg-brand-navy shadow-[0_24px_60px_rgba(0,0,0,0.35)] lg:hidden">
          <div className="section-shell flex flex-col gap-1 py-4">
            {navLinkKeys.map((link) => (
              <Link
                key={link.labelKey}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-light-blue"
              >
                {t(link.labelKey)}
              </Link>
            ))}
            <div className="mt-2 grid gap-2 border-t border-white/15 pt-4">
              <Link
                href={MEMBER_LOGIN_PATH}
                onClick={() => setOpen(false)}
                className={buttonVariants({
                  variant: "secondary",
                  size: "sm",
                  className: "w-full justify-center border-white/20 bg-white/10 text-white",
                })}
              >
                <LogIn size={16} aria-hidden="true" />
                {t("marketing.home.loginToOnlineBanking")}
              </Link>
              <Link
                href={MEMBER_REGISTER_PATH}
                onClick={() => setOpen(false)}
                className={buttonVariants({ size: "sm", className: "w-full justify-center" })}
              >
                <UserPlus size={16} aria-hidden="true" />
                {t("nav.openAccount")}
              </Link>
            </div>
            <div className="px-3 py-2">
              <LanguageSelector
                className="text-white"
                selectClassName="w-full border-white/[0.16] bg-white/[0.08] text-white"
              />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
