"use client";

import { LogIn, Menu, MoreHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { LanguageSelector } from "@/components/i18n/LanguageSelector";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { buttonVariants } from "@/components/ui/Button";
import { useTranslation } from "@/i18n/LocaleProvider";
import { MEMBER_LOGIN_PATH, MEMBER_REGISTER_PATH } from "@/lib/authRoutes";
import { cn } from "@/lib/utils";

const primaryNavKeys = [
  { labelKey: "nav.personal", href: "/personal" },
  { labelKey: "nav.business", href: "/business" },
  { labelKey: "nav.loans", href: "/loans" },
  { labelKey: "nav.about", href: "/about" },
  { labelKey: "nav.support", href: "/support" },
] as const;

const moreNavKeys = [
  { labelKey: "nav.savings", href: "/savings" },
  { labelKey: "nav.rates", href: "/rates" },
  { labelKey: "nav.security", href: "/security" },
  { labelKey: "nav.mobileApp", href: "/mobile-app" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-[60] isolate border-b border-white/10 bg-brand-navy text-white shadow-[0_12px_40px_rgba(20,35,60,0.22)]">
      <nav
        aria-label="Main navigation"
        className="section-shell flex h-16 items-center justify-between gap-4 lg:h-[4.25rem]"
      >
        <BrandLogo priority displayHeight={40} onClick={() => setOpen(false)} />

        <div className="hidden items-center gap-5 lg:flex">
          {primaryNavKeys.map((link) => (
            <Link
              key={link.labelKey}
              href={link.href}
              className="text-sm font-medium text-white/[0.85] transition hover:text-light-blue"
            >
              {t(link.labelKey)}
            </Link>
          ))}
          <div className="relative">
            <button
              type="button"
              aria-expanded={moreOpen}
              aria-haspopup="true"
              onClick={() => setMoreOpen((value) => !value)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white/[0.85] transition hover:text-light-blue"
            >
              More
              <MoreHorizontal size={16} aria-hidden="true" />
            </button>
            {moreOpen ? (
              <>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setMoreOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-2 min-w-[11rem] rounded-lg border border-white/10 bg-brand-navy py-2 shadow-xl">
                  {moreNavKeys.map((link) => (
                    <Link
                      key={link.labelKey}
                      href={link.href}
                      onClick={() => setMoreOpen(false)}
                      className="block px-4 py-2 text-sm font-medium text-white/[0.88] transition hover:bg-white/10 hover:text-light-blue"
                    >
                      {t(link.labelKey)}
                    </Link>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={MEMBER_LOGIN_PATH}
            className={buttonVariants({
              variant: "secondary",
              size: "sm",
              className:
                "hidden h-9 border-white/20 bg-white/10 px-3.5 text-sm text-white sm:inline-flex",
            })}
          >
            <LogIn size={15} aria-hidden="true" />
            {t("nav.login")}
          </Link>

          <Link
            href={MEMBER_REGISTER_PATH}
            className={buttonVariants({
              variant: "primary",
              size: "sm",
              className: "hidden h-9 px-3.5 text-sm sm:inline-flex",
            })}
          >
            {t("nav.join")}
          </Link>

          <button
            type="button"
            aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/30 bg-white/12 text-white lg:hidden"
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <div
        className={cn(
          "overflow-hidden border-t border-white/15 bg-brand-navy lg:hidden",
          open ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="section-shell flex flex-col gap-1 py-4">
          {[...primaryNavKeys, ...moreNavKeys].map((link) => (
            <Link
              key={link.labelKey}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {t(link.labelKey)}
            </Link>
          ))}
          <div className="mt-3 grid gap-2 border-t border-white/15 pt-4">
            <Link
              href={MEMBER_LOGIN_PATH}
              onClick={() => setOpen(false)}
              className={buttonVariants({
                variant: "secondary",
                size: "sm",
                className: "w-full justify-center border-white/20 bg-white/10 text-white",
              })}
            >
              {t("nav.login")}
            </Link>
            <Link
              href={MEMBER_REGISTER_PATH}
              onClick={() => setOpen(false)}
              className={buttonVariants({ size: "sm", className: "w-full justify-center" })}
            >
              {t("nav.openAccount")}
            </Link>
            <div className="px-1 pt-1">
              <LanguageSelector
                className="text-white"
                selectClassName="w-full border-white/20 bg-white/10 text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
