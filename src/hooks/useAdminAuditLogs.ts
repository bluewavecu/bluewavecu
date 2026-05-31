"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import type { AdminAuditLogsData, ApiResponse } from "@/types/banking";

type AdminAuditLogsState = {
  data: AdminAuditLogsData | null;
  error: string | null;
  isLoading: boolean;
  isForbidden: boolean;
  refetch: () => Promise<void>;
};

export function useAdminAuditLogs(): AdminAuditLogsState {
  const redirectToLogin = useUnauthorizedRedirect();
  const [data, setData] = useState<AdminAuditLogsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);

  const fetchLogs = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);
      setIsForbidden(false);

      try {
        const response = await fetch("/api/admin/audit-logs", {
          cache: "no-store",
          credentials: "include",
          signal,
        });
        const payload = (await response.json()) as ApiResponse<AdminAuditLogsData>;

        if (response.status === 401 || (!payload.success && payload.error === "Unauthorized")) {
          setData(null);
          redirectToLogin();
          return;
        }

        if (response.status === 403 || (!payload.success && payload.error === "Forbidden")) {
          setData(null);
          setIsForbidden(true);
          setError("Operations sign-in required.");
          return;
        }

        if (!payload.success) {
          setError(payload.error);
          setData(null);
          return;
        }

        setData(payload.data);
      } catch (fetchError) {
        if (signal?.aborted) {
          return;
        }

        setData(null);
        setError(
          fetchError instanceof Error ? fetchError.message : "Unable to load admin audit logs.",
        );
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [redirectToLogin],
  );

  const refetch = useCallback(async () => {
    await fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchLogs(controller.signal);
      }
    });

    return () => {
      controller.abort();
    };
  }, [fetchLogs]);

  return {
    data,
    error,
    isLoading,
    isForbidden,
    refetch,
  };
}
