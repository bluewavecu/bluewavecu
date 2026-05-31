"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAdminAuditLogs } from "@/hooks/useAdminAuditLogs";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AdminAuditLogsClient() {
  const { data, error, isLoading, isForbidden, refetch } = useAdminAuditLogs();

  if (isLoading) {
    return <LoadingState title="Loading audit logs" message="Retrieving admin activity history." />;
  }

  if (error) {
    return (
      <ApiErrorState
        message={isForbidden ? "Operations sign-in required." : error}
        onRetry={isForbidden ? undefined : refetch}
      />
    );
  }

  const logs = data?.logs ?? [];

  return (
    <section className="grid gap-4">
      {logs.length > 0 ? (
        logs.map((log) => (
          <article
            key={log.id}
            className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-primary-navy dark:text-white">{log.action}</h2>
                <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                  {log.entityType} | {log.entityId}
                </p>
                <p className="mt-2 text-sm text-bluewave-gray dark:text-white/[0.58]">
                  Admin: {log.admin.fullName} ({log.admin.email})
                </p>
              </div>
              <p className="text-sm font-medium text-bluewave-gray dark:text-white/[0.48]">
                {formatDate(log.createdAt)}
              </p>
            </div>
            {log.details ? (
              <pre className="mt-4 overflow-x-auto rounded-lg bg-[#f7fbff] p-4 text-xs text-primary-navy dark:bg-white/[0.05] dark:text-white">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            ) : null}
          </article>
        ))
      ) : (
        <EmptyState title="No audit logs found" message="Admin actions will appear here after updates." />
      )}
    </section>
  );
}
