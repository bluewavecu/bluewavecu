"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import type { AdminRiskData, RiskSeverity } from "@/types/banking";

export function useAdminRisk(severity?: RiskSeverity, eventType?: string) {
  const redirectToLogin = useUnauthorizedRedirect();
  const [data, setData] = useState<AdminRiskData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);

  const fetchRisk = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsForbidden(false);

    const params = new URLSearchParams({ limit: "50" });

    if (severity) {
      params.set("severity", severity);
    }

    if (eventType) {
      params.set("eventType", eventType);
    }

    try {
      const response = await fetch(`/api/admin/risk?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });

      const payload = (await response.json()) as {
        success: boolean;
        data?: AdminRiskData;
        error?: string;
      };

      if (response.status === 401 || (!payload.success && payload.error === "Unauthorized")) {
        redirectToLogin();
        return;
      }

      if (response.status === 403 || (!payload.success && payload.error === "Forbidden")) {
        setIsForbidden(true);
        setError("Operations sign-in required.");
        return;
      }

      if (!payload.success || !payload.data) {
        setError(payload.error ?? "Unable to load risk events.");
        setData(null);
        return;
      }

      setData(payload.data);
    } catch {
      setError("Unable to load risk events.");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [eventType, redirectToLogin, severity]);

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchRisk();
      }
    });

    return () => controller.abort();
  }, [fetchRisk]);

  return {
    data,
    error,
    isLoading,
    isForbidden,
    refetch: fetchRisk,
  };
}
