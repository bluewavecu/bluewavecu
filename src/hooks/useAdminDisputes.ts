"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import { patchJson } from "@/lib/clientApi";
import type { AdminDisputesData, DisputeStatus } from "@/types/banking";

export function useAdminDisputes(status?: DisputeStatus | "ALL") {
  const redirectToLogin = useUnauthorizedRedirect();
  const [data, setData] = useState<AdminDisputesData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchDisputes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsForbidden(false);

    const params = new URLSearchParams();
    if (status && status !== "ALL") {
      params.set("status", status);
    }

    try {
      const response = await fetch(`/api/admin/disputes?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (response.status === 403) {
        setIsForbidden(true);
        setError("Operations sign-in required.");
        return;
      }

      const payload = (await response.json()) as {
        success: boolean;
        data?: AdminDisputesData;
        error?: string;
      };

      if (!payload.success || !payload.data) {
        setError(payload.error ?? "Unable to load disputes.");
        return;
      }

      setData(payload.data);
    } catch {
      setError("Unable to load disputes.");
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin, status]);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchDisputes();
      }
    });
    return () => controller.abort();
  }, [fetchDisputes]);

  const updateDispute = useCallback(
    async (
      disputeId: string,
      nextStatus: DisputeStatus,
      resolutionNote?: string,
    ) => {
      setIsUpdating(true);
      const result = await patchJson("/api/admin/disputes", {
        disputeId,
        status: nextStatus,
        resolutionNote,
      });
      setIsUpdating(false);

      if (!result.success) {
        setError("error" in result ? result.error : "Unable to update dispute.");
        return false;
      }

      await fetchDisputes();
      return true;
    },
    [fetchDisputes],
  );

  return {
    data,
    error,
    isLoading,
    isForbidden,
    isUpdating,
    refetch: fetchDisputes,
    updateDispute,
  };
}
