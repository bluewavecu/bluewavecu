"use client";

import {
  ArrowLeftRight,
  Bell,
  CircleHelp,
  CreditCard,
  FileText,
  Landmark,
  LayoutDashboard,
  LogOut,
  Receipt,
  ReceiptText,
  Scale,
  Settings,
  Shield,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthLogo } from "@/components/layout/AuthLogo";
import {
  isMemberNavActive,
  memberNavSections,
  MEMBER_DASHBOARD_PATH,
} from "@/lib/memberRoutes";
import { cn } from "@/lib/utils";

const iconMap = {
  LayoutDashboard,
  WalletCards,
  ReceiptText,
  ArrowLeftRight,
  Receipt,
  FileText,
  CreditCard,
  Landmark,
  Users,
  Scale,
  CircleHelp,
  Bell,
  UserRound,
  Shield,
  Settings,
};

function NavLink({ href, label, iconName }: { href: string; label: string; iconName: string }) {
  const pathname = usePathname();
  const active = isMemberNavActive(pathname, href);
  const Icon = iconMap[iconName as keyof typeof iconMap] ?? LayoutDashboard;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
        active
          ? "bg-ocean-blue text-primary-navy shadow-[0_14px_34px_rgba(0,168,232,0.24)]"
          : "text-primary-navy/[0.72] hover:bg-primary-navy/[0.06] hover:text-primary-navy dark:text-white/[0.70] dark:hover:bg-white/[0.08] dark:hover:text-white",
      )}
    >
      <Icon size={18} aria-hidden="true" />
      {label}
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const mobilePrimary = memberNavSections.flatMap((section) => section.items).slice(0, 6);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-primary-navy/[0.08] bg-white/88 p-5 shadow-[12px_0_60px_rgba(10,42,94,0.08)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#071526]/92 lg:flex lg:flex-col">
        <AuthLogo href={MEMBER_DASHBOARD_PATH} displayHeight={44} priority className="h-14 items-center" />

        <nav aria-label="Banking app navigation" className="mt-8 flex-1 space-y-6 overflow-y-auto pr-1">
          {memberNavSections.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-bluewave-gray dark:text-white/[0.42]">
                {section.title}
              </p>
              <div className="grid gap-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    iconName={item.icon}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-primary-navy/[0.72] transition hover:bg-primary-navy/[0.06] hover:text-primary-navy dark:text-white/[0.70] dark:hover:bg-white/[0.08] dark:hover:text-white"
        >
          <LogOut size={16} aria-hidden="true" />
          Exit to website
        </Link>
      </aside>

      <nav
        aria-label="Mobile banking app navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-primary-navy/[0.08] bg-white/94 px-2 py-2 shadow-[0_-14px_50px_rgba(10,42,94,0.12)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#071526]/94 lg:hidden"
      >
        <div className="flex gap-1 overflow-x-auto">
          {mobilePrimary.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap] ?? LayoutDashboard;
            const active = isMemberNavActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-[74px] flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-[11px] font-semibold transition",
                  active
                    ? "bg-ocean-blue text-primary-navy"
                    : "text-primary-navy/[0.62] hover:bg-primary-navy/[0.06] dark:text-white/[0.64] dark:hover:bg-white/[0.08]",
                )}
              >
                <Icon size={18} aria-hidden="true" />
                {item.label.split(" ")[0]}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
