"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import { patchJson, postJson } from "@/lib/clientApi";
import type { BillPaymentRecord } from "@/types/banking";

export function useBillPay() {
  const redirectToLogin = useUnauthorizedRedirect();
  const [billPayments, setBillPayments] = useState<BillPaymentRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBillPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/bill-pay", {
        cache: "no-store",
        credentials: "include",
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const payload = (await response.json()) as {
        success: boolean;
        data?: { billPayments: BillPaymentRecord[] };
        error?: string;
      };

      if (!payload.success || !payload.data) {
        setError(payload.error ?? "Unable to load bill payments.");
        setBillPayments([]);
        return;
      }

      setBillPayments(payload.data.billPayments);
    } catch {
      setError("Unable to load bill payments.");
      setBillPayments([]);
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin]);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchBillPayments();
      }
    });
    return () => controller.abort();
  }, [fetchBillPayments]);

  const createBillPayment = useCallback(
    async (input: {
      fromAccountId: string;
      payeeId: string;
      amount: number;
      memo?: string;
      dueDate?: string;
      scheduledFor?: string;
      submitForReview?: boolean;
      transactionPin: string;
    }) => {
      setIsSubmitting(true);
      setError(null);
      const result = await postJson<{ billPayment: BillPaymentRecord; message: string }>(
        "/api/bill-pay",
        input,
      );
      setIsSubmitting(false);
      if (!result.success) {
        setError(result.error);
        return { ok: false as const, error: result.error };
      }
      await fetchBillPayments();
      return { ok: true as const, data: result.data };
    },
    [fetchBillPayments],
  );

  const updateBillPayment = useCallback(
    async (id: string, action: "cancel" | "submit") => {
      setIsSubmitting(true);
      setError(null);
      const result = await patchJson<{ billPayment: BillPaymentRecord }>(`/api/bill-pay/${id}`, {
        action,
      });
      setIsSubmitting(false);
      if (!result.success) {
        setError(result.error);
        return false;
      }
      await fetchBillPayments();
      return true;
    },
    [fetchBillPayments],
  );

  return {
    billPayments,
    error,
    isLoading,
    isSubmitting,
    refetch: fetchBillPayments,
    createBillPayment,
    updateBillPayment,
  };
}
