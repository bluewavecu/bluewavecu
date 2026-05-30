"use client";

import { useState } from "react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminFilterBar, AdminFilterField, AdminFilterPills } from "@/components/admin/AdminFilterBar";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAdminSessions } from "@/hooks/useAdminSessions";

export function AdminSessionsClient() {
  const [activeOnly, setActiveOnly] = useState(false);
  const { data, error, isLoading, isForbidden, refetch } = useAdminSessions(activeOnly);

  if (isLoading) {
    return <LoadingState title="Loading sessions" message="Retrieving member session records." />;
  }

  if (error) {
    return (
      <ApiErrorState
        message={isForbidden ? "Admin access required." : error}
        onRetry={isForbidden ? undefined : refetch}
      />
    );
  }

  const sessions = data?.sessions ?? [];

  return (
    <section className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <AdminMetricCard label="Active sessions" value={data?.summary.active ?? 0} />
        <AdminMetricCard label="Sessions loaded" value={data?.summary.total ?? 0} />
      </div>

      <AdminFilterBar className="lg:grid-cols-1">
        <AdminFilterField label="Session filter">
          <AdminFilterPills
            options={[
              { label: "All sessions" },
              { label: "Active only", value: "active" },
            ]}
            value={activeOnly ? "active" : undefined}
            onChange={(value) => setActiveOnly(value === "active")}
          />
        </AdminFilterField>
      </AdminFilterBar>

      {sessions.length > 0 ? (
        <AdminDataTable columns={["Member", "Device", "IP", "Status", "Last seen"]}>
          {sessions.map((session) => (
            <tr key={session.id} className="border-b border-primary-navy/[0.06] dark:border-white/[0.06]">
              <td className="px-4 py-4">
                <p className="font-semibold text-primary-navy dark:text-white">{session.user.fullName}</p>
                <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">{session.user.email}</p>
              </td>
              <td className="px-4 py-4">{session.deviceName}</td>
              <td className="px-4 py-4">{session.ipAddress}</td>
              <td className="px-4 py-4">
                <AdminStatusBadge status={session.isActive ? "ACTIVE" : "SUSPENDED"} />
              </td>
              <td className="px-4 py-4 text-sm">
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                }).format(new Date(session.lastSeenAt))}
              </td>
            </tr>
          ))}
        </AdminDataTable>
      ) : (
        <EmptyState title="No sessions found" message="Member sign-in sessions will appear here." />
      )}

      <input type="search" className="sr-only" aria-hidden="true" readOnly tabIndex={-1} />
    </section>
  );
}
