"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import type { AdminSessionsData, ApiResponse } from "@/types/banking";

export function useAdminSessions(activeOnly = false) {
  const redirectToLogin = useUnauthorizedRedirect();
  const [data, setData] = useState<AdminSessionsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);

  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);
      setIsForbidden(false);

      const params = activeOnly ? "?active=1" : "";

      try {
        const response = await fetch(`/api/admin/sessions${params}`, {
          cache: "no-store",
          credentials: "include",
          signal,
        });
        const payload = (await response.json()) as ApiResponse<AdminSessionsData>;

        if (response.status === 401 || (!payload.success && payload.error === "Unauthorized")) {
          redirectToLogin();
          return;
        }

        if (response.status === 403 || (!payload.success && payload.error === "Forbidden")) {
          setIsForbidden(true);
          setError("Admin access required.");
          return;
        }

        if (!payload.success) {
          setError(payload.error);
          return;
        }

        setData(payload.data);
      } catch (fetchError) {
        if (!signal?.aborted) {
          setError(fetchError instanceof Error ? fetchError.message : "Unable to load sessions.");
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [activeOnly, redirectToLogin],
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
