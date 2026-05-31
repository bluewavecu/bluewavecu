import { AppHeaderSearch } from "@/components/layout/AppHeaderSearch";
import { AppUserBadge } from "@/components/layout/AppUserBadge";
import { AuthLogo } from "@/components/layout/AuthLogo";
import { NotificationsBell } from "@/components/notifications/NotificationsBell";
import { MEMBER_DASHBOARD_PATH } from "@/lib/memberRoutes";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  hideSearch?: boolean;
};

export function AppHeader({ title, subtitle, hideSearch = false }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-primary-navy/[0.08] bg-[#f7fbff]/86 px-4 py-3 backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#061222]/88 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <AuthLogo href={MEMBER_DASHBOARD_PATH} displayHeight={32} className="mb-3 lg:hidden" />
          <h1 className="text-xl font-semibold text-primary-navy dark:text-white sm:text-2xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-0.5 text-sm text-bluewave-gray dark:text-white/[0.58]">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          {hideSearch ? null : <AppHeaderSearch />}

          <NotificationsBell />

          <AppUserBadge />
        </div>
      </div>
    </header>
  );
}
