"use client";

import {
  ArrowLeftRight,
  CircleHelp,
  CreditCard,
  Gauge,
  Landmark,
  LayoutDashboard,
  LogOut,
  Receipt,
  ReceiptText,
  Shield,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { cn } from "@/lib/utils";

const appRoutes = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Accounts", href: "/accounts", icon: WalletCards },
  { label: "Transfers", href: "/transfers", icon: ArrowLeftRight },
  { label: "Bill Pay", href: "/bill-pay", icon: Receipt },
  { label: "Transactions", href: "/transactions", icon: ReceiptText },
  { label: "Cards", href: "/cards", icon: CreditCard },
  { label: "Loans", href: "/loans", icon: Landmark },
  { label: "Support", href: "/support", icon: CircleHelp },
  { label: "Security", href: "/security", icon: Shield },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-primary-navy/[0.08] bg-white/88 p-5 shadow-[12px_0_60px_rgba(10,42,94,0.08)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#071526]/92 lg:flex lg:flex-col">
        <BrandLogo href="/dashboard" displayHeight={44} priority tone="dark" className="h-14 items-center" />

        <div className="mt-8 rounded-lg border border-primary-navy/[0.08] bg-primary-navy p-4 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ocean-blue text-primary-navy">
              <Gauge size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold">Banking Console</p>
              <p className="text-xs text-white/[0.62]">UI preview mode</p>
            </div>
          </div>
        </div>

        <nav aria-label="Banking app navigation" className="mt-8 grid gap-1.5">
          {appRoutes.map((route) => {
            const Icon = route.icon;
            const active = pathname === route.href;

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition",
                  active
                    ? "bg-ocean-blue text-primary-navy shadow-[0_14px_34px_rgba(0,168,232,0.24)]"
                    : "text-primary-navy/[0.72] hover:bg-primary-navy/[0.06] hover:text-primary-navy dark:text-white/[0.70] dark:hover:bg-white/[0.08] dark:hover:text-white",
                )}
              >
                <Icon size={19} aria-hidden="true" />
                {route.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-lg border border-primary-navy/[0.08] bg-[#f4f9ff] p-4 dark:border-white/[0.08] dark:bg-white/[0.06]">
          <p className="text-xs font-semibold uppercase text-royal-blue dark:text-light-blue">
            Foundation only
          </p>
          <p className="mt-2 text-xs leading-5 text-bluewave-gray dark:text-white/[0.58]">
            Authentication, balances, and member actions are static UI placeholders.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-navy transition hover:text-ocean-blue dark:text-white"
          >
            <LogOut size={16} aria-hidden="true" />
            Exit preview
          </Link>
        </div>
      </aside>

      <nav
        aria-label="Mobile banking app navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-primary-navy/[0.08] bg-white/94 px-2 py-2 shadow-[0_-14px_50px_rgba(10,42,94,0.12)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#071526]/94 lg:hidden"
      >
        <div className="flex gap-1 overflow-x-auto">
          {appRoutes.map((route) => {
            const Icon = route.icon;
            const active = pathname === route.href;

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex min-w-[74px] flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-[11px] font-semibold transition",
                  active
                    ? "bg-ocean-blue text-primary-navy"
                    : "text-primary-navy/[0.62] hover:bg-primary-navy/[0.06] dark:text-white/[0.64] dark:hover:bg-white/[0.08]",
                )}
              >
                <Icon size={18} aria-hidden="true" />
                {route.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
