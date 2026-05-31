"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import type { AdminSettingsData, ApiResponse } from "@/types/banking";

export function useAdminSettings() {
  const redirectToLogin = useUnauthorizedRedirect();
  const [data, setData] = useState<AdminSettingsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);

  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);
      setIsForbidden(false);

      try {
        const response = await fetch("/api/admin/settings", {
          cache: "no-store",
          credentials: "include",
          signal,
        });
        const payload = (await response.json()) as ApiResponse<AdminSettingsData>;

        if (response.status === 401 || (!payload.success && payload.error === "Unauthorized")) {
          redirectToLogin();
          return;
        }

        if (response.status === 403 || (!payload.success && payload.error === "Forbidden")) {
          setIsForbidden(true);
          setError("Operations sign-in required.");
          return;
        }

        if (!payload.success) {
          setError(payload.error);
          return;
        }

        setData(payload.data);
      } catch (fetchError) {
        if (!signal?.aborted) {
          setError(fetchError instanceof Error ? fetchError.message : "Unable to load settings.");
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [redirectToLogin],
  );

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchData(controller.signal);
      }
    });

    return () => controller.abort();
  }, [fetchData]);

  return { data, error, isLoading, isForbidden, refetch: () => fetchData() };
}
