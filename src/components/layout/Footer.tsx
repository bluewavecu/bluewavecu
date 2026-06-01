"use client";

import { ArrowUpRight, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { useTranslation } from "@/i18n/LocaleProvider";
import {
  INSTITUTION,
  formatInstitutionAddress,
} from "@/lib/institution";

const footerGroups = [
  {
    titleKey: "footer.accounts",
    links: [
      { labelKey: "footer.personal", href: "/personal" },
      { labelKey: "footer.business", href: "/business" },
      { labelKey: "footer.savings", href: "/savings" },
      { labelKey: "footer.loans", href: "/loans" },
    ],
  },
  {
    titleKey: "footer.resources",
    links: [
      { labelKey: "footer.onlineBanking", href: "/auth/login" },
      { labelKey: "footer.support", href: "/support" },
      { labelKey: "footer.security", href: "/security" },
      { labelKey: "footer.mobileApp", href: "/mobile-app" },
      { labelKey: "footer.rates", href: "/rates" },
    ],
  },
  {
    titleKey: "footer.company",
    links: [
      { labelKey: "footer.about", href: "/about" },
      { labelKey: "footer.careers", href: "/careers" },
      { labelKey: "footer.newsroom", href: "/newsroom" },
      { labelKey: "footer.contact", href: "/contact" },
    ],
  },
] as const;

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer id="support" className="border-t border-classic-gold/25 bg-brand-navy text-white">
      <div className="section-shell py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1.45fr]">
          <div>
            <BrandLogo href="/" displayHeight={44} priority />
            <p className="mt-5 max-w-md text-sm leading-6 text-white/[0.68]">{t("footer.tagline")}</p>

            <div className="mt-7 grid gap-3 text-sm text-white/[0.72]">
              <span className="flex items-center gap-3">
                <MapPin size={17} className="text-light-blue" aria-hidden="true" />
                {formatInstitutionAddress()}
              </span>
              <Link
                href={`tel:${INSTITUTION.phone.tel}`}
                className="flex items-center gap-3 transition hover:text-light-blue"
              >
                <Phone size={17} className="text-light-blue" aria-hidden="true" />
                {INSTITUTION.phone.display}
              </Link>
              <Link
                href={`mailto:${INSTITUTION.email}`}
                className="flex items-center gap-3 transition hover:text-light-blue"
              >
                <Mail size={17} className="text-light-blue" aria-hidden="true" />
                {INSTITUTION.email}
              </Link>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.titleKey}>
                <h3 className="text-sm font-semibold text-white">{t(group.titleKey)}</h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.labelKey}>
                      <Link
                        href={link.href}
                        className="inline-flex items-center gap-1.5 text-sm text-white/[0.64] transition hover:text-light-blue"
                      >
                        {t(link.labelKey)}
                        <ArrowUpRight size={13} aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-classic-gold/20 pt-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
              <p className="text-sm text-white/[0.58]">
                © {new Date().getFullYear()} {INSTITUTION.legalName}. {t("footer.rights")}
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <Link href="/privacy" className="text-white/[0.64] transition hover:text-light-blue">
                  {t("footer.privacy")}
                </Link>
                <Link href="/terms" className="text-white/[0.64] transition hover:text-light-blue">
                  {t("footer.terms")}
                </Link>
              </div>
            </div>
            <p className="flex max-w-3xl gap-3 text-xs leading-5 text-white/[0.54]">
              <ShieldCheck
                size={17}
                className="mt-0.5 shrink-0 text-light-blue"
                aria-hidden="true"
              />
              <span>{INSTITUTION.ncuaDisclaimer}</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
