"use client";

import Link from "next/link";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminOperationalAlerts } from "@/components/admin/AdminOperationalAlerts";
import { AdminQuickActions } from "@/components/admin/AdminQuickActions";
import { AdminStatusBadge, formatStatusLabel } from "@/components/admin/AdminStatusBadge";
import { AdminSystemHealth } from "@/components/admin/AdminSystemHealth";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/lib/formatCurrency";
import { useAdminCommandCenter } from "@/hooks/useAdminCommandCenter";
import { useAdminSystemHealth } from "@/hooks/useAdminSystemHealth";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AdminCommandCenter() {
  const { data, error, isLoading, isForbidden, refetch } = useAdminCommandCenter();
  const {
    data: healthData,
    error: healthError,
    isLoading: healthLoading,
    refetch: refetchHealth,
  } = useAdminSystemHealth();

  if (isLoading) {
    return <LoadingState title="Loading command center" message="Retrieving operations metrics." />;
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
    return <EmptyState title="No command center data" message="Operations metrics are unavailable." />;
  }

  const { metrics } = data;

  return (
    <section className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
        <AdminMetricCard label="Total members" value={metrics.totalMembers} hint={`${metrics.activeMembers} active`} />
        <AdminMetricCard
          label="Pending KYC"
          value={metrics.pendingKyc}
          tone={metrics.pendingKyc > 0 ? "warning" : "default"}
        />
        <AdminMetricCard
          label="Pending transfers"
          value={metrics.pendingTransfers}
          tone={metrics.pendingTransfers > 0 ? "warning" : "default"}
        />
        <AdminMetricCard
          label="Pending bill pay"
          value={metrics.pendingBillPayments}
          tone={metrics.pendingBillPayments > 0 ? "warning" : "default"}
        />
        <AdminMetricCard
          label="High-risk events"
          value={metrics.highRiskEvents}
          tone={metrics.highRiskEvents > 0 ? "danger" : "default"}
        />
        <AdminMetricCard label="Open disputes" value={metrics.openDisputes} />
        <AdminMetricCard label="Support tickets" value={metrics.openSupportTickets} />
        <AdminMetricCard
          label="Reconciliation mismatches"
          value={metrics.reconciliationMismatches}
          tone={metrics.reconciliationMismatches > 0 ? "warning" : "default"}
        />
        <AdminMetricCard label="Due jobs" value={metrics.dueJobs} hint={`${metrics.failedJobs} failed`} />
        <AdminMetricCard label="Accounts" value={metrics.totalAccounts} hint={`${metrics.totalTransactions} transactions`} />
      </div>

      <AdminOperationalAlerts alerts={data.alerts} onRefresh={() => void refetch()} />

      <AdminQuickActions />

      {!healthLoading && healthData ? (
        <AdminSystemHealth data={healthData} />
      ) : healthError ? (
        <p className="text-sm text-red-700 dark:text-red-300">{healthError}</p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-3">
        <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Recent admin activity</h2>
            <Link href="/admin/audit-logs" className="text-sm font-semibold text-royal-blue dark:text-light-blue">
              View audit logs
            </Link>
          </div>
          <div className="mt-5 divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
            {data.recentAdminActivity.length > 0 ? (
              data.recentAdminActivity.map((log) => (
                <div key={log.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="font-semibold text-primary-navy dark:text-white">{log.action}</p>
                  <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                    {log.admin.fullName} | {formatDate(log.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">No admin activity yet.</p>
            )}
          </div>
        </article>

        <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Recent event logs</h2>
            <Link href="/admin/event-logs" className="text-sm font-semibold text-royal-blue dark:text-light-blue">
              View all
            </Link>
          </div>
          <div className="mt-5 divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
            {data.recentEvents.length > 0 ? (
              data.recentEvents.map((event) => (
                <div key={event.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="font-semibold text-primary-navy dark:text-white">{event.message}</p>
                  <p className="mt-1 text-xs text-bluewave-gray dark:text-white/[0.58]">
                    {event.eventType} | {formatDate(event.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">No events recorded.</p>
            )}
          </div>
        </article>

        <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Recent members</h2>
            <Link href="/admin/users" className="text-sm font-semibold text-royal-blue dark:text-light-blue">
              View all
            </Link>
          </div>
          <div className="mt-5 divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
            {data.recentUsers.map((user) => (
              <div key={user.id} className="py-3 first:pt-0 last:pb-0">
                <p className="font-semibold text-primary-navy dark:text-white">{user.fullName}</p>
                <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">{user.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <AdminStatusBadge status={user.status} />
                  <AdminStatusBadge status={user.role} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Recent transactions</h2>
            <Link href="/admin/transactions" className="text-sm font-semibold text-royal-blue dark:text-light-blue">
              View all
            </Link>
          </div>
          <div className="mt-5 divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
            {data.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="font-semibold text-primary-navy dark:text-white">
                    {transaction.merchant ?? transaction.description}
                  </p>
                  <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                    {transaction.user.fullName}
                  </p>
                  <AdminStatusBadge status={transaction.status} />
                </div>
                <p className="text-sm font-semibold text-primary-navy dark:text-white">
                  {formatCurrency(Math.abs(transaction.amount))}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Recent support tickets</h2>
            <Link href="/admin/support" className="text-sm font-semibold text-royal-blue dark:text-light-blue">
              View all
            </Link>
          </div>
          <div className="mt-5 divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
            {data.recentSupportTickets.map((ticket) => (
              <div key={ticket.id} className="py-3 first:pt-0 last:pb-0">
                <p className="font-semibold text-primary-navy dark:text-white">{ticket.subject}</p>
                <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                  {ticket.user.fullName} | {formatStatusLabel(ticket.status)}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <button type="button" onClick={() => void refetchHealth()} className="sr-only">
        Refresh system health
      </button>
    </section>
  );
}
