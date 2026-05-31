import Link from "next/link";
import {
  ArrowLeftRight,
  BadgeCheck,
  Cog,
  CreditCard,
  FileBarChart,
  Receipt,
  Scale,
  Users,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const actions = [
  { label: "Review memberships", href: "/lex/auth/users", icon: Users },
  { label: "Review Transfers", href: "/lex/auth/transfer-reviews", icon: ArrowLeftRight },
  { label: "Review Bill Pay", href: "/lex/auth/bill-pay", icon: Receipt },
  { label: "Review KYC", href: "/lex/auth/compliance", icon: BadgeCheck },
  { label: "Review ID photos", href: "/lex/auth/id-verifications", icon: BadgeCheck },
  { label: "Card applications", href: "/lex/auth/card-applications", icon: CreditCard },
  { label: "View Reconciliation", href: "/lex/auth/reconciliation", icon: Scale },
  { label: "Run Due Jobs", href: "/lex/auth/jobs", icon: Cog },
  { label: "Finance Reports", href: "/lex/auth/finance-reports", icon: FileBarChart },
];

export function AdminQuickActions() {
  return (
    <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
      <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Quick actions</h2>
      <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
        Common money-movement and compliance review tasks.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "justify-start gap-2 border-primary-navy/[0.08] bg-[#f7fbff] dark:border-white/[0.08] dark:bg-white/[0.04]",
              )}
            >
              <Icon size={16} aria-hidden="true" />
              {action.label}
            </Link>
          );
        })}
      </div>
    </article>
  );
}
