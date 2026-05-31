"use client";

import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAdminSettings } from "@/hooks/useAdminSettings";

export function AdminSettingsClient() {
  const { data, error, isLoading, isForbidden, refetch, updateBankingPolicy, isSavingPolicy, policyError } =
    useAdminSettings();

  if (isLoading) {
    return <LoadingState title="Loading settings" message="Retrieving system configuration." />;
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
    return (
      <EmptyState
        title="Settings unavailable"
        message="System configuration could not be loaded. Refresh the page or try again later."
      />
    );
  }

  return (
    <section className="grid gap-5">
      <ChangePasswordForm
        title="Operations password"
        description="Update your sign-in password for the operations console. You will remain signed in after updating."
      />

      <AdminPageHeader
        title="Environment"
        description="Review environment configuration and banking controls for transfers, verification, and review workflows."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AdminMetricCard label="Environment" value={data.environment} />
        <AdminMetricCard label="System mode" value={data.systemMode} />
        <AdminMetricCard label="App URL" value={data.appUrl} />
        <AdminMetricCard
          label="Email service"
          value={data.emailConfigured ? "Configured" : "Not configured"}
          tone={data.emailConfigured ? "default" : "warning"}
        />
        <AdminMetricCard
          label="Alert inbox"
          value={data.adminAlertEmail ?? "Not set"}
        />
        <AdminMetricCard
          label="Cron secret"
          value={data.cronConfigured ? "Configured" : "Not configured"}
          tone={data.cronConfigured ? "default" : "warning"}
        />
        <AdminMetricCard
          label="Environment data lock"
          value={data.demoSeedProtected ? "Enabled" : "Disabled"}
          tone={data.demoSeedProtected ? "default" : "warning"}
        />
      </div>

      <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]">
        <h3 className="font-semibold text-primary-navy dark:text-white">Banking controls</h3>
        <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
          Global transfer verification and review settings. Individual members can still be marked
          friction-free under Users.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex items-center justify-between rounded-lg border border-primary-navy/[0.08] px-4 py-3 dark:border-white/[0.08]">
            <span className="text-sm font-medium text-primary-navy dark:text-white">
              Require email OTP before transfers
            </span>
            <input
              type="checkbox"
              checked={data.bankingPolicy.requireTransactionOtp}
              disabled={isSavingPolicy}
              onChange={(event) =>
                void updateBankingPolicy({ requireTransactionOtp: event.target.checked })
              }
            />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-primary-navy/[0.08] px-4 py-3 dark:border-white/[0.08]">
            <span className="text-sm font-medium text-primary-navy dark:text-white">
              Require admin review for transfers
            </span>
            <input
              type="checkbox"
              checked={data.bankingPolicy.requireTransferReview}
              disabled={isSavingPolicy}
              onChange={(event) =>
                void updateBankingPolicy({ requireTransferReview: event.target.checked })
              }
            />
          </label>
        </div>
        {policyError ? <p className="mt-3 text-sm text-red-700">{policyError}</p> : null}
      </article>

      <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]">
        <h3 className="font-semibold text-primary-navy dark:text-white">Feature flags</h3>
        <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
          Operational modules enabled for this environment.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {Object.entries(data.featureFlags).map(([key, enabled]) => (
            <li
              key={key}
              className="flex items-center justify-between rounded-lg border border-primary-navy/[0.08] px-4 py-3 dark:border-white/[0.08]"
            >
              <span className="text-sm font-medium text-primary-navy dark:text-white">
                {key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}
              </span>
              <AdminStatusBadge status={enabled ? "ACTIVE" : "SUSPENDED"} />
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
