"use client";

import Link from "next/link";
import { KeyRound, SlidersHorizontal, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { useTranslation } from "@/i18n/LocaleProvider";
import { adminConsolePath } from "@/lib/adminRoutes";
import { cn } from "@/lib/utils";

const overviewQuickLinks = [
  {
    labelKey: "admin.nav.adjustments",
    href: adminConsolePath("adjustments"),
    icon: SlidersHorizontal,
  },
  {
    labelKey: "admin.nav.generateTransactions",
    href: adminConsolePath("transaction-generator"),
    icon: Sparkles,
  },
  {
    labelKey: "admin.nav.transferVerification",
    href: adminConsolePath("transfer-verification"),
    icon: KeyRound,
  },
] as const;

export function AdminOverviewQuickAccess() {
  const { t } = useTranslation();

  return (
    <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
      <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Quick access</h2>
      <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
        Fund accounts, generate activity, and manage transfer verification.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {overviewQuickLinks.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "justify-center gap-2 border-primary-navy/[0.08] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.08] dark:bg-white/[0.04]",
              )}
            >
              <Icon size={16} aria-hidden="true" />
              {t(link.labelKey)}
            </Link>
          );
        })}
      </div>
    </article>
  );
}
