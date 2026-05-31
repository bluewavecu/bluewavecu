"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import { patchJson } from "@/lib/clientApi";
import type { AdminSettingsData, ApiResponse, BankingPolicyData } from "@/types/banking";

export function useAdminSettings() {
  const redirectToLogin = useUnauthorizedRedirect();
  const [data, setData] = useState<AdminSettingsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);
  const [policyError, setPolicyError] = useState<string | null>(null);

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

  const updateBankingPolicy = useCallback(
    async (input: Partial<Pick<BankingPolicyData, "requireTransactionOtp" | "requireTransferReview">>) => {
      setIsSavingPolicy(true);
      setPolicyError(null);

      const result = await patchJson<{ policy: BankingPolicyData }>(
        "/api/admin/settings/banking",
        input,
      );

      setIsSavingPolicy(false);

      if (!result.success) {
        setPolicyError(result.error);
        return false;
      }

      setData((current) =>
        current
          ? {
              ...current,
              bankingPolicy: result.data.policy,
              featureFlags: {
                ...current.featureFlags,
                transferReview: result.data.policy.requireTransferReview,
                transactionOtp: result.data.policy.requireTransactionOtp,
              },
            }
          : current,
      );

      return true;
    },
    [],
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

  return {
    data,
    error,
    isLoading,
    isForbidden,
    isSavingPolicy,
    policyError,
    refetch: () => fetchData(),
    updateBankingPolicy,
  };
}
