"use client";

import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAdminSettings } from "@/hooks/useAdminSettings";

export function AdminSettingsClient() {
  const { data, error, isLoading, isForbidden, refetch } = useAdminSettings();

  if (isLoading) {
    return <LoadingState title="Loading settings" message="Retrieving system configuration." />;
  }

  if (error) {
    return (
      <ApiErrorState
        message={isForbidden ? "Admin access required." : error}
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
      <AdminPageHeader
        title="Environment"
        description="Configuration values are read-only in this release. Editable settings will be added in a future step."
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
          label="Admin alert email"
          value={data.adminAlertEmail ?? "Not set"}
        />
        <AdminMetricCard
          label="Cron secret"
          value={data.cronConfigured ? "Configured" : "Not configured"}
          tone={data.cronConfigured ? "default" : "warning"}
        />
        <AdminMetricCard
          label="Demo seed protection"
          value={data.demoSeedProtected ? "Protected" : "Unprotected"}
          tone={data.demoSeedProtected ? "default" : "warning"}
        />
      </div>

      <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]">
        <h3 className="font-semibold text-primary-navy dark:text-white">Feature flags</h3>
        <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
          Placeholder toggles for operational modules.
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
