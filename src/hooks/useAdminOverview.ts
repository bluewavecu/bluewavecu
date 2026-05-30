"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import type { AdminOverviewData, ApiResponse } from "@/types/banking";

type AdminOverviewState = {
  data: AdminOverviewData | null;
  error: string | null;
  isLoading: boolean;
  isForbidden: boolean;
  refetch: () => Promise<void>;
};

export function useAdminOverview(): AdminOverviewState {
  const redirectToLogin = useUnauthorizedRedirect();
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);

  const fetchOverview = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);
      setIsForbidden(false);

      try {
        const response = await fetch("/api/admin/overview", {
          cache: "no-store",
          credentials: "include",
          signal,
        });
        const payload = (await response.json()) as ApiResponse<AdminOverviewData>;

        if (response.status === 401 || (!payload.success && payload.error === "Unauthorized")) {
          setData(null);
          redirectToLogin();
          return;
        }

        if (response.status === 403 || (!payload.success && payload.error === "Forbidden")) {
          setData(null);
          setIsForbidden(true);
          setError("Admin access required.");
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
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load admin overview data.",
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
    await fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchOverview(controller.signal);
      }
    });

    return () => {
      controller.abort();
    };
  }, [fetchOverview]);

  return {
    data,
    error,
    isLoading,
    isForbidden,
    refetch,
  };
}
