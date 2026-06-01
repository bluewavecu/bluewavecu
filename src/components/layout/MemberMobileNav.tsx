"use client";

import {
  ArrowLeftRight,
  Bell,
  CircleHelp,
  CreditCard,
  FileText,
  ExternalLink,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  ReceiptText,
  Scale,
  Settings,
  Shield,
  UserRound,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthLogo } from "@/components/layout/AuthLogo";
import { LanguageSelector } from "@/components/i18n/LanguageSelector";
import { useMemberLogout } from "@/hooks/useMemberLogout";
import { useTranslation } from "@/i18n/LocaleProvider";
import { isMemberNavActive, memberNavSections, MEMBER_DASHBOARD_PATH } from "@/lib/memberRoutes";
import { cn } from "@/lib/utils";

const iconMap = {
  LayoutDashboard,
  WalletCards,
  ReceiptText,
  ArrowLeftRight,
  Receipt,
  FileText,
  CreditCard,
  Landmark,
  Users,
  Scale,
  CircleHelp,
  Bell,
  UserRound,
  Shield,
  Settings,
};

export function MemberMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();
  const { signOut, isSigningOut } = useMemberLogout();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary-navy/[0.12] bg-primary-navy text-white shadow-[0_6px_20px_rgba(10,42,94,0.22)]"
      >
        {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label={t("nav.closeMenu")}
            className="absolute inset-0 bg-primary-navy/60"
            onClick={() => setOpen(false)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.openMenu")}
            className="absolute inset-y-0 left-0 flex w-[min(100%,20.5rem)] flex-col bg-white shadow-2xl dark:bg-[#071526]"
          >
            <div className="flex items-center justify-between border-b border-primary-navy/[0.08] px-4 py-3 dark:border-white/[0.08]">
              <AuthLogo href={MEMBER_DASHBOARD_PATH} displayHeight={36} onClick={() => setOpen(false)} />
              <button
                type="button"
                aria-label={t("nav.closeMenu")}
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-primary-navy transition hover:bg-primary-navy/[0.06] dark:text-white dark:hover:bg-white/[0.08]"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Mobile banking app navigation" className="flex-1 overflow-y-auto px-3 py-4">
              {memberNavSections.map((section) => (
                <div key={section.titleKey} className="mb-5 last:mb-0">
                  <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-bluewave-gray dark:text-white/[0.42]">
                    {t(section.titleKey)}
                  </p>
                  <div className="grid gap-0.5">
                    {section.items.map((item) => {
                      const Icon = iconMap[item.icon as keyof typeof iconMap] ?? LayoutDashboard;
                      const active = isMemberNavActive(pathname, item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
                            active
                              ? "bg-ocean-blue text-primary-navy"
                              : "text-primary-navy hover:bg-primary-navy/[0.06] dark:text-white/[0.9] dark:hover:bg-white/[0.08]",
                          )}
                        >
                          <Icon size={18} aria-hidden="true" />
                          {t(item.labelKey)}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="space-y-2 border-t border-primary-navy/[0.08] bg-[#f7fbff] p-4 dark:border-white/[0.08] dark:bg-white/[0.04]">
              <div className="px-1">
                <LanguageSelector
                  selectClassName="w-full border-primary-navy/[0.10] bg-white dark:border-white/[0.10] dark:bg-white/[0.06]"
                />
              </div>
              <button
                type="button"
                onClick={() => void signOut()}
                disabled={isSigningOut}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-royal-blue disabled:opacity-70 dark:bg-ocean-blue dark:text-primary-navy"
              >
                <LogOut size={16} aria-hidden="true" />
                {isSigningOut ? t("common.signingOut") : t("common.signOut")}
              </button>
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary-navy/[0.10] px-4 py-2.5 text-sm font-semibold text-primary-navy transition hover:bg-white dark:border-white/[0.10] dark:text-white"
              >
                <ExternalLink size={15} aria-hidden="true" />
                {t("common.exitWebsite")}
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
