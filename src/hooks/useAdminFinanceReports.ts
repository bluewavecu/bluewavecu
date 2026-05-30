"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import type { FinanceReportsData } from "@/types/banking";

export function useAdminFinanceReports(from?: string, to?: string) {
  const redirectToLogin = useUnauthorizedRedirect();
  const [data, setData] = useState<FinanceReportsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsForbidden(false);

    const params = new URLSearchParams();
    if (from) {
      params.set("from", from);
    }
    if (to) {
      params.set("to", to);
    }

    try {
      const response = await fetch(`/api/admin/finance-reports?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });

      const payload = (await response.json()) as {
        success: boolean;
        data?: FinanceReportsData;
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
        setError(payload.error ?? "Unable to load finance reports.");
        return;
      }

      setData(payload.data);
    } catch {
      setError("Unable to load finance reports.");
    } finally {
      setIsLoading(false);
    }
  }, [from, redirectToLogin, to]);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchReports();
      }
    });
    return () => controller.abort();
  }, [fetchReports]);

  return {
    data,
    error,
    isLoading,
    isForbidden,
    refetch: fetchReports,
  };
}
