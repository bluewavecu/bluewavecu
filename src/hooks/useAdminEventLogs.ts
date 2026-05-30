"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import type { EventLogsData, EventSeverity } from "@/types/banking";

export function useAdminEventLogs(
  severity?: EventSeverity | "ALL",
  eventType?: string,
  entityType?: string,
) {
  const redirectToLogin = useUnauthorizedRedirect();
  const [data, setData] = useState<EventLogsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsForbidden(false);

    const params = new URLSearchParams();
    if (severity && severity !== "ALL") {
      params.set("severity", severity);
    }
    if (eventType && eventType !== "ALL") {
      params.set("eventType", eventType);
    }
    if (entityType && entityType !== "ALL") {
      params.set("entityType", entityType);
    }

    try {
      const response = await fetch(`/api/admin/event-logs?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (response.status === 403) {
        setIsForbidden(true);
        setError("Admin access required.");
        return;
      }

      const payload = (await response.json()) as {
        success: boolean;
        data?: EventLogsData;
        error?: string;
      };

      if (!payload.success || !payload.data) {
        setError(payload.error ?? "Unable to load event logs.");
        return;
      }

      setData(payload.data);
    } catch {
      setError("Unable to load event logs.");
    } finally {
      setIsLoading(false);
    }
  }, [entityType, eventType, redirectToLogin, severity]);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchEvents();
      }
    });
    return () => controller.abort();
  }, [fetchEvents]);

  return {
    data,
    error,
    isLoading,
    isForbidden,
    refetch: fetchEvents,
  };
}
