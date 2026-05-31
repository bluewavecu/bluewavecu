"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import { patchJson } from "@/lib/clientApi";
import type {
  AdminTransactionFilters,
  AdminTransactionRecord,
  AdminTransactionsData,
  ApiResponse,
  TransactionStatus,
} from "@/types/banking";

type AdminTransactionsState = {
  data: AdminTransactionsData | null;
  error: string | null;
  isLoading: boolean;
  isForbidden: boolean;
  isUpdating: boolean;
  updateError: string | null;
  refetch: () => Promise<void>;
  updateTransactionStatus: (
    transactionId: string,
    status: Extract<TransactionStatus, "COMPLETED" | "FAILED" | "REVERSED">,
    reviewNote?: string,
  ) => Promise<boolean>;
};

function buildTransactionsUrl(filters?: AdminTransactionFilters) {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.set("status", filters.status);
  }

  if (filters?.type) {
    params.set("type", filters.type);
  }

  const query = params.toString();
  return query ? `/api/admin/transactions?${query}` : "/api/admin/transactions";
}

export function useAdminTransactions(filters?: AdminTransactionFilters): AdminTransactionsState {
  const redirectToLogin = useUnauthorizedRedirect();
  const [data, setData] = useState<AdminTransactionsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const requestUrl = useMemo(() => buildTransactionsUrl(filters), [filters]);

  const fetchTransactions = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);
      setIsForbidden(false);

      try {
        const response = await fetch(requestUrl, {
          cache: "no-store",
          credentials: "include",
          signal,
        });
        const payload = (await response.json()) as ApiResponse<AdminTransactionsData>;

        if (response.status === 401 || (!payload.success && payload.error === "Unauthorized")) {
          setData(null);
          redirectToLogin();
          return;
        }

        if (response.status === 403 || (!payload.success && payload.error === "Forbidden")) {
          setData(null);
          setIsForbidden(true);
          setError("Operations sign-in required.");
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
            : "Unable to load admin transactions.",
        );
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [requestUrl, redirectToLogin],
  );

  const refetch = useCallback(async () => {
    await fetchTransactions();
  }, [fetchTransactions]);

  const updateTransactionStatus = useCallback(
    async (
      transactionId: string,
      status: Extract<TransactionStatus, "COMPLETED" | "FAILED" | "REVERSED">,
      reviewNote?: string,
    ) => {
      setIsUpdating(true);
      setUpdateError(null);

      const result = await patchJson<{ transaction: AdminTransactionRecord }>(
        "/api/admin/transactions",
        { transactionId, status, ...(reviewNote ? { reviewNote } : {}) },
      );

      if (!result.success) {
        setUpdateError(result.error);
        setIsUpdating(false);
        return false;
      }

      setData((current) =>
        current
          ? {
              transactions: current.transactions.map((transaction) =>
                transaction.id === transactionId ? result.data.transaction : transaction,
              ),
            }
          : current,
      );
      setIsUpdating(false);
      return true;
    },
    [],
  );

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
    isForbidden,
    isUpdating,
    updateError,
    refetch,
    updateTransactionStatus,
  };
}
