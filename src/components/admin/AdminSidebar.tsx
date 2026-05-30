"use client";

import {
  ArrowLeft,
  BadgeCheck,
  ClipboardList,
  Cog,
  FileBarChart,
  LayoutDashboard,
  ListTree,
  Receipt,
  ReceiptText,
  Scale,
  Shield,
  ShieldAlert,
  SlidersHorizontal,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { cn } from "@/lib/utils";

const adminRoutes = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Compliance", href: "/admin/compliance", icon: BadgeCheck },
  { label: "Accounts", href: "/admin/accounts", icon: WalletCards },
  { label: "Transactions", href: "/admin/transactions", icon: ReceiptText },
  { label: "Bill Pay Review", href: "/admin/bill-pay", icon: Receipt },
  { label: "Adjustments", href: "/admin/adjustments", icon: SlidersHorizontal },
  { label: "Disputes", href: "/admin/disputes", icon: ReceiptText },
  { label: "Jobs", href: "/admin/jobs", icon: Cog },
  { label: "Reconciliation", href: "/admin/reconciliation", icon: Scale },
  { label: "Finance Reports", href: "/admin/finance-reports", icon: FileBarChart },
  { label: "Event Logs", href: "/admin/event-logs", icon: ListTree },
  { label: "Support", href: "/admin/support", icon: Shield },
  { label: "Risk Monitoring", href: "/admin/risk", icon: ShieldAlert },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: ClipboardList },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-primary-navy/[0.08] bg-white/92 p-5 shadow-[12px_0_60px_rgba(10,42,94,0.08)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#071526]/92 lg:flex lg:flex-col">
        <BrandLogo href="/admin" displayHeight={44} priority tone="dark" className="h-14 items-center" />

        <div className="mt-8 rounded-lg border border-primary-navy/[0.08] bg-primary-navy p-4 text-white">
          <p className="text-sm font-semibold">Admin Console</p>
          <p className="mt-1 text-xs text-white/[0.62]">Role-guarded operations</p>
        </div>

        <nav aria-label="Admin navigation" className="mt-8 grid gap-1.5">
          {adminRoutes.map((route) => {
            const Icon = route.icon;
            const active =
              route.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(route.href);

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
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-navy transition hover:text-ocean-blue dark:text-white"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Banking
          </Link>
        </div>
      </aside>

      <nav
        aria-label="Mobile admin navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-primary-navy/[0.08] bg-white/94 px-2 py-2 shadow-[0_-14px_50px_rgba(10,42,94,0.12)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#071526]/94 lg:hidden"
      >
        <div className="flex gap-1 overflow-x-auto">
          {adminRoutes.map((route) => {
            const Icon = route.icon;
            const active =
              route.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(route.href);

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
