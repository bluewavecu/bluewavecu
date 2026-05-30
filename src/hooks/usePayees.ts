"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import { patchJson, postJson } from "@/lib/clientApi";
import type { PayeeRecord } from "@/types/banking";

export function usePayees() {
  const redirectToLogin = useUnauthorizedRedirect();
  const [payees, setPayees] = useState<PayeeRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPayees = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payees", {
        cache: "no-store",
        credentials: "include",
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const payload = (await response.json()) as {
        success: boolean;
        data?: { payees: PayeeRecord[] };
        error?: string;
      };

      if (!payload.success || !payload.data) {
        setError(payload.error ?? "Unable to load payees.");
        setPayees([]);
        return;
      }

      setPayees(payload.data.payees);
    } catch {
      setError("Unable to load payees.");
      setPayees([]);
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin]);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchPayees();
      }
    });
    return () => controller.abort();
  }, [fetchPayees]);

  const createPayee = useCallback(
    async (input: {
      name: string;
      nickname?: string;
      category?: string;
      accountNumber?: string;
      routingNumber?: string;
      address?: string;
      phone?: string;
    }) => {
      setIsSubmitting(true);
      setError(null);
      const result = await postJson<{ payee: PayeeRecord }>("/api/payees", input);
      setIsSubmitting(false);
      if (!result.success) {
        setError(result.error);
        return false;
      }
      await fetchPayees();
      return true;
    },
    [fetchPayees],
  );

  const updatePayee = useCallback(
    async (id: string, input: Partial<PayeeRecord>) => {
      setIsSubmitting(true);
      setError(null);
      const result = await patchJson<{ payee: PayeeRecord }>(`/api/payees/${id}`, input);
      setIsSubmitting(false);
      if (!result.success) {
        setError(result.error);
        return false;
      }
      await fetchPayees();
      return true;
    },
    [fetchPayees],
  );

  const deletePayee = useCallback(
    async (id: string) => {
      setIsSubmitting(true);
      setError(null);
      const response = await fetch(`/api/payees/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const payload = (await response.json()) as { success: boolean; error?: string };
      setIsSubmitting(false);
      if (!payload.success) {
        setError(payload.error ?? "Unable to delete payee.");
        return false;
      }
      await fetchPayees();
      return true;
    },
    [fetchPayees],
  );

  return {
    payees,
    error,
    isLoading,
    isSubmitting,
    refetch: fetchPayees,
    createPayee,
    updatePayee,
    deletePayee,
  };
}
