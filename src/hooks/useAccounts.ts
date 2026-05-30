"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AccountsData, ApiResponse } from "@/types/banking";

type AccountsState = {
  data: AccountsData | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

export function useAccounts(): AccountsState {
  const router = useRouter();
  const [data, setData] = useState<AccountsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAccounts = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/accounts", {
          cache: "no-store",
          credentials: "include",
          signal,
        });
        const payload = (await response.json()) as ApiResponse<AccountsData>;

        if (response.status === 401 || (!payload.success && payload.error === "Unauthorized")) {
          setData(null);
          router.replace("/login");
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
            : "Unable to load authenticated account data.",
        );
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [router],
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
    refetch,
  };
}
