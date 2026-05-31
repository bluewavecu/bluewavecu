"use client";

import { AdminCommandPanel, AdminMetricCard } from "@/components/admin/AdminMetricCard";
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
        message={isForbidden ? "Operations sign-in required." : error}
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
        <AdminMetricCard
          label="Total members"
          value={metrics.totalMembers}
          hint={`${metrics.activeMembers} active`}
          href="/lex/auth/users"
        />
        <AdminMetricCard
          label="Pending KYC"
          value={metrics.pendingKyc}
          tone={metrics.pendingKyc > 0 ? "warning" : "default"}
          href="/lex/auth/compliance"
        />
        <AdminMetricCard
          label="Pending transfers"
          value={metrics.pendingTransfers}
          tone={metrics.pendingTransfers > 0 ? "warning" : "default"}
          href="/lex/auth/transfer-reviews"
        />
        <AdminMetricCard
          label="Pending bill pay"
          value={metrics.pendingBillPayments}
          tone={metrics.pendingBillPayments > 0 ? "warning" : "default"}
          href="/lex/auth/bill-pay"
        />
        <AdminMetricCard
          label="High-risk events"
          value={metrics.highRiskEvents}
          tone={metrics.highRiskEvents > 0 ? "danger" : "default"}
          href="/lex/auth/risk"
        />
        <AdminMetricCard label="Open disputes" value={metrics.openDisputes} href="/lex/auth/disputes" />
        <AdminMetricCard
          label="Support tickets"
          value={metrics.openSupportTickets}
          href="/lex/auth/support"
        />
        <AdminMetricCard
          label="Reconciliation mismatches"
          value={metrics.reconciliationMismatches}
          tone={metrics.reconciliationMismatches > 0 ? "warning" : "default"}
          href="/lex/auth/reconciliation"
        />
        <AdminMetricCard
          label="Due jobs"
          value={metrics.dueJobs}
          hint={`${metrics.failedJobs} failed`}
          href="/lex/auth/jobs"
        />
        <AdminMetricCard
          label="Accounts"
          value={metrics.totalAccounts}
          hint={`${metrics.totalTransactions} transactions`}
          href="/lex/auth/accounts"
        />
      </div>

      <AdminOperationalAlerts alerts={data.alerts} onRefresh={() => void refetch()} />

      <AdminQuickActions />

      {!healthLoading && healthData ? (
        <AdminSystemHealth data={healthData} />
      ) : healthError ? (
        <p className="text-sm text-red-700 dark:text-red-300">{healthError}</p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-3">
        <AdminCommandPanel title="Recent operations activity" href="/lex/auth/audit-logs">
          <div className="divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
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
              <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">No operations activity yet.</p>
            )}
          </div>
        </AdminCommandPanel>

        <AdminCommandPanel title="Recent event logs" href="/lex/auth/event-logs">
          <div className="divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
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
        </AdminCommandPanel>

        <AdminCommandPanel title="Recent members" href="/lex/auth/users">
          <div className="divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
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
        </AdminCommandPanel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <AdminCommandPanel title="Recent transactions" href="/lex/auth/transactions">
          <div className="divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
            {data.recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
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
        </AdminCommandPanel>

        <AdminCommandPanel title="Recent support tickets" href="/lex/auth/support">
          <div className="divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
            {data.recentSupportTickets.map((ticket) => (
              <div key={ticket.id} className="py-3 first:pt-0 last:pb-0">
                <p className="font-semibold text-primary-navy dark:text-white">{ticket.subject}</p>
                <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                  {ticket.user.fullName} | {formatStatusLabel(ticket.status)}
                </p>
              </div>
            ))}
          </div>
        </AdminCommandPanel>
      </div>

      <button type="button" onClick={() => void refetchHealth()} className="sr-only">
        Refresh system health
      </button>
    </section>
  );
}
