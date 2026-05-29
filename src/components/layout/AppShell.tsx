import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";

type AppShellProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
};

export function AppShell({ children, title, subtitle }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f7fbff] text-foreground dark:bg-[#061222] dark:text-white">
      <AppSidebar />
      <div className="min-h-screen lg:pl-72">
        <AppHeader title={title} subtitle={subtitle} />
        <main className="px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10">{children}</main>
      </div>
    </div>
  );
}
