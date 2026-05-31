import type { ReactNode } from "react";
import { InactivityLogoutGuard } from "@/components/auth/InactivityLogoutGuard";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

type AdminShellProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
};

export function AdminShell({ children, title, subtitle }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#f7fbff] text-foreground dark:bg-[#061222] dark:text-white">
      <InactivityLogoutGuard portal="admin" />
      <AdminSidebar />
      <div className="min-h-screen lg:pl-72">
        <AdminHeader title={title} subtitle={subtitle} />
        <main className="px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10">{children}</main>
      </div>
    </div>
  );
}
