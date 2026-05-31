"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Amount } from "@/components/ui/Amount";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatStatusLabel, StatusBadge, statusToTone } from "@/components/ui/StatusBadge";
import { useMemberSummary } from "@/hooks/useMemberSummary";

export function AttentionPanel() {
  const { summary, isLoading } = useMemberSummary();

  if (isLoading) {
    return (
      <LoadingState
        title="Loading attention items"
        message="Reviewing pending items and profile status."
      />
    );
  }

  if (!summary) {
    return null;
  }

  const items: Array<{ label: string; href: string; count?: number }> = [];

  if (summary.pendingTransferCount > 0) {
    items.push({
      label: `${summary.pendingTransferCount} transfer(s) pending review`,
      href: "/auth/transfers",
      count: summary.pendingTransferCount,
    });
  }

  if (summary.pendingBillPaymentCount > 0) {
    items.push({
      label: `${summary.pendingBillPaymentCount} bill payment(s) in review`,
      href: "/auth/bill-pay",
      count: summary.pendingBillPaymentCount,
    });
  }

  if (summary.openDisputeCount > 0) {
    items.push({
      label: `${summary.openDisputeCount} open dispute(s)`,
      href: "/auth/disputes",
      count: summary.openDisputeCount,
    });
  }

  if (summary.needsProfileCompletion) {
    items.push({ label: "Complete profile & KYC verification", href: "/auth/profile" });
  }

  if (summary.needsIdVerification) {
    items.push({ label: "Submit your ID photos for verification", href: "/auth/profile" });
  }

  if (summary.pendingIdVerificationCount > 0) {
    items.push({
      label: `${summary.pendingIdVerificationCount} ID submission(s) pending review`,
      href: "/auth/profile",
      count: summary.pendingIdVerificationCount,
    });
  }

  if (summary.unreadNotificationCount > 0) {
    items.push({
      label: `${summary.unreadNotificationCount} unread notification(s)`,
      href: "/auth/notifications",
      count: summary.unreadNotificationCount,
    });
  }

  if (summary.openSupportTicketCount > 0) {
    items.push({
      label: `${summary.openSupportTicketCount} open support ticket(s)`,
      href: "/auth/support",
      count: summary.openSupportTicketCount,
    });
  }

  return (
    <section className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
            What needs attention
          </h2>
          <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
            Total available: <Amount value={summary.totalAvailableBalance} showSign={false} />
          </p>
        </div>
        <StatusBadge
          label={formatStatusLabel(summary.kycStatus)}
          tone={statusToTone(summary.kycStatus)}
        />
      </div>

      {items.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {items.map((item) => (
            <li key={item.href + item.label}>
              <Link
                href={item.href}
                className="flex items-center justify-between rounded-lg border border-primary-navy/[0.08] bg-[#f7fbff] px-4 py-3 text-sm font-semibold text-primary-navy transition hover:border-ocean-blue/[0.40] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
              >
                <span className="inline-flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-600" aria-hidden="true" />
                  {item.label}
                </span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-bluewave-gray dark:text-white/[0.58]">
          You&apos;re all caught up. No pending reviews or profile actions right now.
        </p>
      )}
    </section>
  );
}
