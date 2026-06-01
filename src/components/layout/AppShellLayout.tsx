"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AccountReadOnlyBanner } from "@/components/layout/AccountReadOnlyBanner";
import { InactivityLogoutGuard } from "@/components/auth/InactivityLogoutGuard";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useTranslation } from "@/i18n/LocaleProvider";
import { resolvePageMeta } from "@/i18n/pageMeta";

type AppShellLayoutProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  hideHeaderSearch?: boolean;
  compactMobileHeader?: boolean;
};

export function AppShellLayout({
  children,
  title,
  subtitle,
  hideHeaderSearch,
  compactMobileHeader,
}: AppShellLayoutProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const meta = resolvePageMeta(pathname, "member");

  const resolvedTitle = meta ? t(meta.titleKey) : title ?? "";
  const resolvedSubtitle = meta?.subtitleKey ? t(meta.subtitleKey) : subtitle;

  return (
    <div className="min-h-screen bg-[#f7fbff] text-foreground dark:bg-[#061222] dark:text-white">
      <InactivityLogoutGuard portal="member" />
      <AppSidebar />
      <div className="min-h-screen lg:pl-72">
        <AppHeader
          title={resolvedTitle}
          subtitle={resolvedSubtitle}
          hideSearch={hideHeaderSearch}
          compactMobile={compactMobileHeader}
        />
        <main className="px-4 pb-8 pt-4 sm:px-6 lg:px-8 lg:pb-10 lg:pt-3">
          <AccountReadOnlyBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
