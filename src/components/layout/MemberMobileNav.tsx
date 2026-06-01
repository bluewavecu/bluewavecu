"use client";

import {
  ArrowLeftRight,
  Bell,
  CircleHelp,
  CreditCard,
  FileText,
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
import { useTranslation } from "@/i18n/LocaleProvider";
import { isMemberNavActive, memberNavSections } from "@/lib/memberRoutes";
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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary-navy/20 bg-white text-primary-navy shadow-[0_8px_24px_rgba(10,42,94,0.18)] transition hover:border-ocean-blue/50 hover:bg-[#f7fbff] dark:border-white/25 dark:bg-[#0d1f38] dark:text-white dark:shadow-[0_8px_24px_rgba(0,0,0,0.45)] lg:hidden"
      >
        {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label={t("nav.closeMenu")}
            className="absolute inset-0 bg-primary-navy/55 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.openMenu")}
            className="absolute inset-y-0 left-0 flex w-[min(100%,20rem)] flex-col border-r border-primary-navy/[0.08] bg-white shadow-2xl dark:border-white/[0.08] dark:bg-[#071526]"
          >
            <div className="flex items-center justify-between border-b border-primary-navy/[0.08] px-4 py-4 dark:border-white/[0.08]">
              <p className="text-sm font-semibold text-primary-navy dark:text-white">Menu</p>
              <button
                type="button"
                aria-label={t("nav.closeMenu")}
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-primary-navy transition hover:bg-primary-navy/[0.06] dark:text-white dark:hover:bg-white/[0.08]"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Mobile banking app navigation" className="flex-1 overflow-y-auto p-4">
              {memberNavSections.map((section) => (
                <div key={section.titleKey} className="mb-6 last:mb-0">
                  <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-bluewave-gray dark:text-white/[0.42]">
                    {t(section.titleKey)}
                  </p>
                  <div className="grid gap-1">
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
                              ? "bg-ocean-blue text-primary-navy shadow-[0_14px_34px_rgba(0,168,232,0.24)]"
                              : "text-primary-navy/[0.72] hover:bg-primary-navy/[0.06] hover:text-primary-navy dark:text-white/[0.70] dark:hover:bg-white/[0.08] dark:hover:text-white",
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

            <div className="border-t border-primary-navy/[0.08] p-4 dark:border-white/[0.08]">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-primary-navy/[0.72] transition hover:bg-primary-navy/[0.06] dark:text-white/[0.70] dark:hover:bg-white/[0.08]"
              >
                <LogOut size={16} aria-hidden="true" />
                {t("common.exitWebsite")}
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
