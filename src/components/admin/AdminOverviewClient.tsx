"use client";

import Link from "next/link";
import { AlertTriangle, BellRing, RefreshCw } from "lucide-react";
import { AdminStatCards } from "@/components/admin/AdminStatCards";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/lib/formatCurrency";
import { useAdminOperationalAlerts } from "@/hooks/useNotifications";
import { useAdminOverview } from "@/hooks/useAdminOverview";
import { useAdminRisk } from "@/hooks/useAdminRisk";
import { cn } from "@/lib/utils";

function getStatusLabel(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function AdminOverviewClient() {
  const { data, error, isLoading, isForbidden, refetch } = useAdminOverview();
  const {
    alerts,
    error: alertsError,
    isLoading: alertsLoading,
    refetch: refetchAlerts,
  } = useAdminOperationalAlerts();
  const { data: riskData } = useAdminRisk("HIGH");

  if (isLoading) {
    return <LoadingState title="Loading admin overview" message="Retrieving platform metrics." />;
  }

  if (error) {
    return (
      <ApiErrorState
        message={isForbidden ? "Administrator access required. Sign in with an authorized admin account." : error}
        onRetry={isForbidden ? undefined : refetch}
      />
    );
  }

  if (!data) {
    return <EmptyState title="No overview data" message="Admin metrics are unavailable." />;
  }

  return (
    <section className="grid gap-5">
      <AdminStatCards
        items={[
          { label: "Users", value: data.counts.users, hint: `${data.counts.activeUsers} active` },
          {
            label: "Pending users",
            value: data.counts.pendingUsers,
            hint: "Awaiting activation",
          },
          { label: "Accounts", value: data.counts.accounts },
          {
            label: "Pending transfers",
            value: data.counts.pendingTransfers,
            hint: `${data.counts.transactions} total transactions`,
          },
        ]}
      />

      {riskData && riskData.summary.highOrCritical > 0 ? (
        <article className="rounded-lg border border-amber-500/[0.30] bg-amber-500/[0.06] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
                High-risk alerts
              </h2>
              <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                {riskData.summary.highOrCritical} high or critical risk event
                {riskData.summary.highOrCritical === 1 ? "" : "s"} require review.
              </p>
            </div>
            <Link
              href="/admin/risk"
              className="text-sm font-semibold text-royal-blue dark:text-light-blue"
            >
              Open risk monitoring
            </Link>
          </div>
        </article>
      ) : null}

      <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellRing size={18} className="text-ocean-blue" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
              Operational alerts
            </h2>
          </div>
          <button
            type="button"
            onClick={() => void refetchAlerts()}
            className="inline-flex items-center gap-1 text-sm font-semibold text-royal-blue dark:text-light-blue"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Refresh
          </button>
        </div>
        <p className="mt-2 text-sm text-bluewave-gray dark:text-white/[0.58]">
          Pending transfers, failed reviews, open support tickets, and recent security events.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {alertsLoading ? (
            <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">Loading alerts...</p>
          ) : alertsError ? (
            <p className="text-sm text-red-700 dark:text-red-300">{alertsError}</p>
          ) : alerts.length > 0 ? (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "rounded-lg border p-4",
                  alert.severity === "warning"
                    ? "border-amber-500/[0.30] bg-amber-500/[0.06]"
                    : "border-primary-navy/[0.08] bg-[#f7fbff] dark:border-white/[0.08] dark:bg-white/[0.04]",
                )}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={18}
                    className={cn(
                      "mt-0.5 shrink-0",
                      alert.severity === "warning"
                        ? "text-amber-600 dark:text-amber-300"
                        : "text-ocean-blue",
                    )}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold text-primary-navy dark:text-white">{alert.title}</p>
                    <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                      {alert.message}
                    </p>
                    {alert.href ? (
                      <Link
                        href={alert.href}
                        className="mt-2 inline-block text-xs font-semibold text-royal-blue dark:text-light-blue"
                      >
                        Review
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">
              No operational alerts right now.
            </p>
          )}
        </div>
      </article>

      <div className="grid gap-5 xl:grid-cols-3">
        <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Recent users</h2>
            <Link href="/admin/users" className="text-sm font-semibold text-royal-blue dark:text-light-blue">
              View all
            </Link>
          </div>
          <div className="mt-5 divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
            {data.recentUsers.map((user) => (
              <div key={user.id} className="py-3 first:pt-0 last:pb-0">
                <p className="font-semibold text-primary-navy dark:text-white">{user.fullName}</p>
                <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">{user.email}</p>
                <p className="mt-2 text-xs font-semibold text-royal-blue dark:text-light-blue">
                  {getStatusLabel(user.status)} | {getStatusLabel(user.role)}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
              Recent transactions
            </h2>
            <Link
              href="/admin/transactions"
              className="text-sm font-semibold text-royal-blue dark:text-light-blue"
            >
              View all
            </Link>
          </div>
          <div className="mt-5 divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
            {data.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-primary-navy dark:text-white">
                      {transaction.merchant ?? transaction.description}
                    </p>
                    <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                      {transaction.user.fullName}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-primary-navy dark:text-white">
                    {formatCurrency(Math.abs(transaction.amount))}
                  </p>
                </div>
                <span
                  className={cn(
                    "mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                    transaction.status === "PENDING"
                      ? "bg-amber-500/[0.12] text-amber-700 dark:text-amber-300"
                      : "bg-ocean-blue/[0.10] text-royal-blue dark:text-light-blue",
                  )}
                >
                  {getStatusLabel(transaction.status)}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
              Recent support tickets
            </h2>
            <Link href="/admin/support" className="text-sm font-semibold text-royal-blue dark:text-light-blue">
              View all
            </Link>
          </div>
          <p className="mt-2 text-sm text-bluewave-gray dark:text-white/[0.58]">
            {data.counts.supportTickets} total tickets
          </p>
          <div className="mt-5 divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
            {data.recentSupportTickets.map((ticket) => (
              <div key={ticket.id} className="py-3 first:pt-0 last:pb-0">
                <p className="font-semibold text-primary-navy dark:text-white">{ticket.subject}</p>
                <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                  {ticket.user.fullName} | {formatDate(ticket.createdAt)}
                </p>
                <p className="mt-2 text-xs font-semibold text-royal-blue dark:text-light-blue">
                  {getStatusLabel(ticket.status)} | {getStatusLabel(ticket.priority)}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
