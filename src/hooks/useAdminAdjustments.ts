"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import { patchJson, postJson } from "@/lib/clientApi";
import type { AdjustmentRecord, AdjustmentStatus, AdjustmentsData } from "@/types/banking";

export function useAdminAdjustments(status?: AdjustmentStatus | "ALL") {
  const redirectToLogin = useUnauthorizedRedirect();
  const [data, setData] = useState<AdjustmentsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAdjustments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsForbidden(false);

    const params = new URLSearchParams();
    if (status && status !== "ALL") {
      params.set("status", status);
    }

    try {
      const response = await fetch(`/api/admin/adjustments?${params.toString()}`, {
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
        data?: AdjustmentsData;
        error?: string;
      };

      if (!payload.success || !payload.data) {
        setError(payload.error ?? "Unable to load adjustments.");
        return;
      }

      setData(payload.data);
    } catch {
      setError("Unable to load adjustments.");
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin, status]);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchAdjustments();
      }
    });
    return () => controller.abort();
  }, [fetchAdjustments]);

  const createAdjustment = useCallback(
    async (input: {
      accountId: string;
      amount: number;
      direction: "DEBIT" | "CREDIT";
      reason: string;
      effectiveAt: string;
    }) => {
      setIsSubmitting(true);
      const result = await postJson<{ adjustment: AdjustmentRecord }>(
        "/api/admin/adjustments",
        input,
      );
      setIsSubmitting(false);

      if (!result.success) {
        setError("error" in result ? result.error : "Unable to create adjustment.");
        return false;
      }

      await fetchAdjustments();
      return true;
    },
    [fetchAdjustments],
  );

  const actionAdjustment = useCallback(
    async (
      adjustmentId: string,
      action: "APPROVE" | "REJECT" | "POST",
      reviewNote?: string,
    ) => {
      setIsSubmitting(true);
      const result = await patchJson("/api/admin/adjustments", {
        adjustmentId,
        action,
        reviewNote,
      });
      setIsSubmitting(false);

      if (!result.success) {
        setError("error" in result ? result.error : "Unable to update adjustment.");
        return false;
      }

      await fetchAdjustments();
      return true;
    },
    [fetchAdjustments],
  );

  return {
    data,
    error,
    isLoading,
    isForbidden,
    isSubmitting,
    refetch: fetchAdjustments,
    createAdjustment,
    actionAdjustment,
  };
}
