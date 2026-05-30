"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import { patchJson } from "@/lib/clientApi";
import type { AdminBillPaymentsData, BillPaymentStatus } from "@/types/banking";

export function useAdminBillPay(status?: BillPaymentStatus | "ALL", search?: string) {
  const redirectToLogin = useUnauthorizedRedirect();
  const [data, setData] = useState<AdminBillPaymentsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  const fetchBillPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsForbidden(false);

    const params = new URLSearchParams();
    if (status && status !== "ALL") {
      params.set("status", status);
    }
    if (search) {
      params.set("search", search);
    }

    try {
      const response = await fetch(`/api/admin/bill-pay?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });

      const payload = (await response.json()) as {
        success: boolean;
        data?: AdminBillPaymentsData;
        error?: string;
      };

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (response.status === 403) {
        setIsForbidden(true);
        setError("Admin access required.");
        return;
      }

      if (!payload.success || !payload.data) {
        setError(payload.error ?? "Unable to load bill payments.");
        return;
      }

      setData(payload.data);
    } catch {
      setError("Unable to load bill payments.");
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin, search, status]);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchBillPayments();
      }
    });
    return () => controller.abort();
  }, [fetchBillPayments]);

  const reviewBillPayment = useCallback(
    async (billPaymentId: string, action: "APPROVE" | "FAIL" | "CANCEL", reviewNote?: string) => {
      setIsReviewing(true);
      setError(null);
      const result = await patchJson("/api/admin/bill-pay", {
        billPaymentId,
        action,
        reviewNote,
      });
      setIsReviewing(false);
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
    data,
    error,
    isLoading,
    isForbidden,
    isReviewing,
    refetch: fetchBillPayments,
    reviewBillPayment,
  };
}
