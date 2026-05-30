import {
  ArrowLeftRight,
  CircleHelp,
  CreditCard,
  Landmark,
  ReceiptText,
  Send,
} from "lucide-react";
import Link from "next/link";
import {
  MEMBER_LOANS_PATH,
  MEMBER_SUPPORT_PATH,
} from "@/lib/memberRoutes";

const quickActions = [
  { label: "Transfer", href: "/transfers", icon: Send },
  { label: "Pay Card", href: "/cards", icon: CreditCard },
  { label: "View Activity", href: "/transactions", icon: ReceiptText },
  { label: "Loan Center", href: MEMBER_LOANS_PATH, icon: Landmark },
  { label: "Support", href: MEMBER_SUPPORT_PATH, icon: CircleHelp },
  { label: "Move Money", href: "/transfers", icon: ArrowLeftRight },
];

export function QuickActions() {
  return (
    <section
      aria-labelledby="quick-actions"
      className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 id="quick-actions" className="text-lg font-semibold text-primary-navy dark:text-white">
            Quick actions
          </h2>
          <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
            Static shortcuts for future banking flows.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={`${action.label}-${action.href}`}
              href={action.href}
              className="flex min-h-28 flex-col justify-between rounded-lg border border-primary-navy/[0.08] bg-[#f7fbff] p-4 text-primary-navy transition hover:-translate-y-0.5 hover:border-ocean-blue/[0.40] hover:bg-ocean-blue/[0.08] dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
            >
              <Icon size={22} className="text-royal-blue dark:text-light-blue" aria-hidden="true" />
              <span className="text-sm font-semibold">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
