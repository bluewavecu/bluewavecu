"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import type { ApiResponse, LoansData } from "@/types/banking";

type LoansState = {
  data: LoansData | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

export function useLoans(): LoansState {
  const redirectToLogin = useUnauthorizedRedirect();
  const [data, setData] = useState<LoansData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLoans = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/loans", {
          cache: "no-store",
          credentials: "include",
          signal,
        });
        const payload = (await response.json()) as ApiResponse<LoansData>;

        if (response.status === 401 || (!payload.success && payload.error === "Unauthorized")) {
          setData(null);
          redirectToLogin();
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
            : "Unable to load authenticated loan data.",
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
    await fetchLoans();
  }, [fetchLoans]);

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchLoans(controller.signal);
      }
    });

    return () => {
      controller.abort();
    };
  }, [fetchLoans]);

  return {
    data,
    error,
    isLoading,
    refetch,
  };
}
