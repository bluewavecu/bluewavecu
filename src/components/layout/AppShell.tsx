import type { ReactNode } from "react";
import { InactivityLogoutGuard } from "@/components/auth/InactivityLogoutGuard";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";

type AppShellProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  hideHeaderSearch?: boolean;
  compactMobileHeader?: boolean;
};

export function AppShell({
  children,
  title,
  subtitle,
  hideHeaderSearch,
  compactMobileHeader,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f7fbff] text-foreground dark:bg-[#061222] dark:text-white">
      <InactivityLogoutGuard portal="member" />
      <AppSidebar />
      <div className="min-h-screen lg:pl-72">
        <AppHeader
          title={title}
          subtitle={subtitle}
          hideSearch={hideHeaderSearch}
          compactMobile={compactMobileHeader}
        />
        <main className="px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10">{children}</main>
      </div>
    </div>
  );
}
