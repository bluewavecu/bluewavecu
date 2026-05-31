import { Search, ShieldCheck } from "lucide-react";
import { AppUserBadge } from "@/components/layout/AppUserBadge";
import { NotificationsBell } from "@/components/notifications/NotificationsBell";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
};

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-primary-navy/[0.08] bg-[#f7fbff]/86 px-4 py-4 backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#061222]/88 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-ocean-blue/[0.10] px-3 py-1 text-xs font-semibold text-royal-blue dark:text-light-blue">
            <ShieldCheck size={14} aria-hidden="true" />
            Secure online banking
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-primary-navy dark:text-white sm:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm leading-6 text-bluewave-gray dark:text-white/[0.62]">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <label className="hidden min-w-[280px] items-center gap-3 rounded-full border border-primary-navy/[0.08] bg-white px-4 py-3 text-sm text-bluewave-gray shadow-[0_12px_36px_rgba(10,42,94,0.06)] dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-white/[0.58] md:flex">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Search</span>
            <input
              type="search"
              placeholder="Search transactions, cards, support"
              className="w-full bg-transparent text-primary-navy outline-none placeholder:text-bluewave-gray dark:text-white"
            />
          </label>

          <NotificationsBell />

          <AppUserBadge />
        </div>
      </div>
    </header>
  );
}
