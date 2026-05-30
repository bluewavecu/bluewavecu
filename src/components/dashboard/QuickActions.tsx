import {
  ArrowLeftRight,
  CircleHelp,
  Download,
  Receipt,
  Scale,
  Send,
  UserPlus,
} from "lucide-react";
import { ActionCard } from "@/components/ui/ActionCard";
import { MEMBER_SUPPORT_PATH } from "@/lib/memberRoutes";

const quickActions = [
  { label: "Transfer", href: "/transfers", icon: Send, description: "Move money between accounts" },
  { label: "Pay Bill", href: "/bill-pay", icon: Receipt, description: "Submit bill payment for review" },
  { label: "Add Payee", href: "/payees", icon: UserPlus, description: "Manage recipients" },
  {
    label: "Download Statement",
    href: "/statements",
    icon: Download,
    description: "CSV or PDF export",
  },
  { label: "Dispute Transaction", href: "/disputes", icon: Scale, description: "Report an issue" },
  { label: "Contact Support", href: MEMBER_SUPPORT_PATH, icon: CircleHelp, description: "Open a ticket" },
  { label: "Move Money", href: "/transfers", icon: ArrowLeftRight, description: "Immediate or scheduled" },
];

export function QuickActions() {
  return (
    <section
      aria-labelledby="quick-actions"
      className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
    >
      <div>
        <h2 id="quick-actions" className="text-lg font-semibold text-primary-navy dark:text-white">
          Quick actions
        </h2>
        <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
          Common banking tasks — transfers and payments are reviewed before posting.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {quickActions.map((action) => (
          <ActionCard
            key={`${action.label}-${action.href}`}
            label={action.label}
            href={action.href}
            icon={action.icon}
            description={action.description}
          />
        ))}
      </div>
    </section>
  );
}
