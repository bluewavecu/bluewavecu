"use client";

import { AdminOperationalAlerts } from "@/components/admin/AdminOperationalAlerts";
import { AdminQuickActions } from "@/components/admin/AdminQuickActions";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAdminCommandCenter } from "@/hooks/useAdminCommandCenter";

export function AdminOperationalAlertsClient() {
  const { data, error, isLoading, isForbidden, refetch } = useAdminCommandCenter();

  if (isLoading) {
    return <LoadingState title="Loading alerts" message="Retrieving operational alerts." />;
  }

  if (error) {
    return (
      <ApiErrorState
        message={isForbidden ? "Operations sign-in required." : error}
        onRetry={isForbidden ? undefined : refetch}
      />
    );
  }

  return (
    <section className="grid gap-5">
      <AdminOperationalAlerts alerts={data?.alerts ?? []} onRefresh={() => void refetch()} />
      <AdminQuickActions />
    </section>
  );
}
