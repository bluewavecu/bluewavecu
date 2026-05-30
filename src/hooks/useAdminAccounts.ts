"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import type { AdminAccountsData, ApiResponse } from "@/types/banking";

type AdminAccountsState = {
  data: AdminAccountsData | null;
  error: string | null;
  isLoading: boolean;
  isForbidden: boolean;
  refetch: () => Promise<void>;
};

export function useAdminAccounts(): AdminAccountsState {
  const redirectToLogin = useUnauthorizedRedirect();
  const [data, setData] = useState<AdminAccountsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);

  const fetchAccounts = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);
      setIsForbidden(false);

      try {
        const response = await fetch("/api/admin/accounts", {
          cache: "no-store",
          credentials: "include",
          signal,
        });
        const payload = (await response.json()) as ApiResponse<AdminAccountsData>;

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
          fetchError instanceof Error ? fetchError.message : "Unable to load admin accounts.",
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
    await fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchAccounts(controller.signal);
      }
    });

    return () => {
      controller.abort();
    };
  }, [fetchAccounts]);

  return {
    data,
    error,
    isLoading,
    isForbidden,
    refetch,
  };
}
