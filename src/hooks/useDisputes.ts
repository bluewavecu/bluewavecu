"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import { patchJson, postJson } from "@/lib/clientApi";
import type { DisputeRecord } from "@/types/banking";

export function useDisputes() {
  const redirectToLogin = useUnauthorizedRedirect();
  const [disputes, setDisputes] = useState<DisputeRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDisputes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/disputes", {
        cache: "no-store",
        credentials: "include",
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const payload = (await response.json()) as {
        success: boolean;
        data?: { disputes: DisputeRecord[] };
        error?: string;
      };

      if (!payload.success || !payload.data) {
        setError(payload.error ?? "Unable to load disputes.");
        setDisputes([]);
        return;
      }

      setDisputes(payload.data.disputes);
    } catch {
      setError("Unable to load disputes.");
      setDisputes([]);
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin]);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchDisputes();
      }
    });
    return () => controller.abort();
  }, [fetchDisputes]);

  const createDispute = useCallback(
    async (input: { transactionId: string; reason: string; description: string }) => {
      setIsSubmitting(true);
      setError(null);
      const result = await postJson<{ dispute: DisputeRecord }>("/api/disputes", input);
      setIsSubmitting(false);

      if (!result.success) {
        setError("error" in result ? result.error : "Unable to create dispute.");
        return false;
      }

      await fetchDisputes();
      return true;
    },
    [fetchDisputes],
  );

  const closeDispute = useCallback(
    async (disputeId: string) => {
      setIsSubmitting(true);
      const result = await patchJson(`/api/disputes/${disputeId}`, { action: "close" });
      setIsSubmitting(false);

      if (!result.success) {
        setError("error" in result ? result.error : "Unable to close dispute.");
        return false;
      }

      await fetchDisputes();
      return true;
    },
    [fetchDisputes],
  );

  return {
    disputes,
    error,
    isLoading,
    isSubmitting,
    refetch: fetchDisputes,
    createDispute,
    closeDispute,
  };
}
