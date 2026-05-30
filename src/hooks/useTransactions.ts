"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiResponse, TransactionFilters, TransactionsData } from "@/types/banking";

type TransactionsState = {
  data: TransactionsData | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

function buildTransactionsUrl(filters?: TransactionFilters) {
  const params = new URLSearchParams();

  if (filters?.accountId) {
    params.set("accountId", filters.accountId);
  }

  if (filters?.status) {
    params.set("status", filters.status);
  }

  if (filters?.type) {
    params.set("type", filters.type);
  }

  if (filters?.limit) {
    params.set("limit", String(filters.limit));
  }

  const query = params.toString();
  return query ? `/api/transactions?${query}` : "/api/transactions";
}

export function useTransactions(filters?: TransactionFilters): TransactionsState {
  const router = useRouter();
  const [data, setData] = useState<TransactionsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const requestUrl = useMemo(() => buildTransactionsUrl(filters), [filters]);

  const fetchTransactions = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(requestUrl, {
          cache: "no-store",
          credentials: "include",
          signal,
        });
        const payload = (await response.json()) as ApiResponse<TransactionsData>;

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
            : "Unable to load authenticated transaction data.",
        );
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [requestUrl, router],
  );

  const refetch = useCallback(async () => {
    await fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchTransactions(controller.signal);
      }
    });

    return () => {
      controller.abort();
    };
  }, [fetchTransactions]);

  return {
    data,
    error,
    isLoading,
    refetch,
  };
}
