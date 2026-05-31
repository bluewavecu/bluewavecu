"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { InactivityLogoutGuard } from "@/components/auth/InactivityLogoutGuard";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useTranslation } from "@/i18n/LocaleProvider";
import { resolvePageMeta } from "@/i18n/pageMeta";

type AdminShellLayoutProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

export function AdminShellLayout({ children, title, subtitle }: AdminShellLayoutProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const meta = resolvePageMeta(pathname, "admin");

  const resolvedTitle = meta ? t(meta.titleKey) : title ?? "";
  const resolvedSubtitle = meta?.subtitleKey ? t(meta.subtitleKey) : subtitle;

  return (
    <div className="min-h-screen bg-[#f7fbff] text-foreground dark:bg-[#061222] dark:text-white">
      <InactivityLogoutGuard portal="admin" />
      <AdminSidebar />
      <div className="min-h-screen lg:pl-72">
        <AdminHeader title={resolvedTitle} subtitle={resolvedSubtitle} />
        <main className="px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10">{children}</main>
      </div>
    </div>
  );
}
