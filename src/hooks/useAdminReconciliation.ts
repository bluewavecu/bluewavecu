"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import type { ReconciliationSummary } from "@/types/banking";

export function useAdminReconciliation() {
  const redirectToLogin = useUnauthorizedRedirect();
  const [data, setData] = useState<ReconciliationSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);

  const fetchReconciliation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsForbidden(false);

    try {
      const response = await fetch("/api/admin/reconciliation", {
        cache: "no-store",
        credentials: "include",
      });

      const payload = (await response.json()) as {
        success: boolean;
        data?: ReconciliationSummary;
        error?: string;
      };

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (response.status === 403) {
        setIsForbidden(true);
        setError("Admin access required.");
        return;
      }

      if (!payload.success || !payload.data) {
        setError(payload.error ?? "Unable to load reconciliation data.");
        return;
      }

      setData(payload.data);
    } catch {
      setError("Unable to load reconciliation data.");
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin]);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchReconciliation();
      }
    });
    return () => controller.abort();
  }, [fetchReconciliation]);

  return {
    data,
    error,
    isLoading,
    isForbidden,
    refetch: fetchReconciliation,
  };
}
