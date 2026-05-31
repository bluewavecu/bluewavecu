"use client";

import { LanguageSelector } from "@/components/i18n/LanguageSelector";
import { AdminNotificationsBell } from "@/components/admin/AdminNotificationsBell";
import { AppUserBadge } from "@/components/layout/AppUserBadge";
import { useAutoHideOnScroll } from "@/hooks/useAutoHideOnScroll";
import { useTranslation } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

type AdminHeaderProps = {
  title: string;
  subtitle?: string;
};

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const { t } = useTranslation();
  const visible = useAutoHideOnScroll();

  return (
    <>
      <header
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-40 transition-transform duration-300 ease-out lg:left-72",
          visible ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <div className="flex items-start justify-end gap-3 px-4 pb-2 pt-3 sm:px-6 lg:px-8">
          <div
            className="pointer-events-auto flex items-stretch overflow-hidden rounded-full border border-primary-navy/[0.08] bg-[#f7fbff]/92 shadow-[0_12px_34px_rgba(10,42,94,0.10)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#061222]/92"
            aria-label={t("common.accountTools")}
          >
            <div className="flex items-center pl-2">
              <LanguageSelector compact showIcon={false} />
            </div>
            <span
              className="my-2 w-px shrink-0 bg-primary-navy/[0.10] dark:bg-white/[0.12]"
              aria-hidden="true"
            />
            <AdminNotificationsBell grouped />
            <span
              className="my-2 w-px shrink-0 bg-primary-navy/[0.10] dark:bg-white/[0.12]"
              aria-hidden="true"
            />
            <AppUserBadge grouped />
          </div>
        </div>
      </header>

      <div className="px-4 pt-3 sm:px-6 lg:px-8 lg:pt-4">
        <h1 className="text-2xl font-semibold text-primary-navy dark:text-white sm:text-3xl">{title}</h1>
        {subtitle ? (
          <p className="mt-1 max-w-3xl text-sm leading-6 text-bluewave-gray dark:text-white/[0.62]">
            {subtitle}
          </p>
        ) : null}
      </div>
    </>
  );
}
