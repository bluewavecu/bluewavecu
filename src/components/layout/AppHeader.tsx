"use client";

import { AppHeaderSearch } from "@/components/layout/AppHeaderSearch";
import { AppUserBadge } from "@/components/layout/AppUserBadge";
import { AuthLogo } from "@/components/layout/AuthLogo";
import { LanguageSelector } from "@/components/i18n/LanguageSelector";
import { NotificationsBell } from "@/components/notifications/NotificationsBell";
import { useAutoHideOnScroll } from "@/hooks/useAutoHideOnScroll";
import { useTranslation } from "@/i18n/LocaleProvider";
import { MEMBER_DASHBOARD_PATH } from "@/lib/memberRoutes";
import { cn } from "@/lib/utils";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  hideSearch?: boolean;
  compactMobile?: boolean;
};

export function AppHeader({
  title,
  subtitle,
  hideSearch = false,
  compactMobile = false,
}: AppHeaderProps) {
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
        <div className="flex items-start justify-between gap-3 px-4 pb-2 pt-3 sm:px-6 lg:px-8">
          <div className="pointer-events-auto flex min-w-0 items-center gap-3 lg:hidden">
            <AuthLogo href={MEMBER_DASHBOARD_PATH} displayHeight={32} />
          </div>

          <div className="pointer-events-auto ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
            {hideSearch ? null : (
              <div className="hidden md:block">
                <AppHeaderSearch />
              </div>
            )}

            <div
              className="flex items-stretch overflow-hidden rounded-full border border-primary-navy/[0.08] bg-[#f7fbff]/92 shadow-[0_12px_34px_rgba(10,42,94,0.10)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#061222]/92"
              aria-label={t("common.accountTools")}
            >
              <div className="flex items-center pl-2">
                <LanguageSelector compact showIcon={false} />
              </div>
              <span
                className="my-2 w-px shrink-0 bg-primary-navy/[0.10] dark:bg-white/[0.12]"
                aria-hidden="true"
              />
              <NotificationsBell grouped />
              <span
                className="my-2 w-px shrink-0 bg-primary-navy/[0.10] dark:bg-white/[0.12]"
                aria-hidden="true"
              />
              <AppUserBadge grouped />
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 pt-3 sm:px-6 lg:px-8 lg:pt-4">
        {compactMobile ? (
          <>
            <h1 className="hidden text-xl font-semibold text-primary-navy dark:text-white sm:text-2xl lg:block">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-0.5 hidden text-sm text-bluewave-gray dark:text-white/[0.58] lg:block">
                {subtitle}
              </p>
            ) : null}
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-primary-navy dark:text-white sm:text-2xl">{title}</h1>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-bluewave-gray dark:text-white/[0.58]">{subtitle}</p>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
