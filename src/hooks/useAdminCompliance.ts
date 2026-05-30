"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import { patchJson } from "@/lib/clientApi";
import type { AdminComplianceData, KycStatus } from "@/types/banking";

export function useAdminCompliance(status?: KycStatus | "ALL") {
  const redirectToLogin = useUnauthorizedRedirect();
  const [data, setData] = useState<AdminComplianceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchCompliance = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsForbidden(false);

    const params = new URLSearchParams();
    if (status && status !== "ALL") {
      params.set("status", status);
    }

    try {
      const response = await fetch(`/api/admin/compliance?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (response.status === 403) {
        setIsForbidden(true);
        setError("Admin access required.");
        return;
      }

      const payload = (await response.json()) as {
        success: boolean;
        data?: AdminComplianceData;
        error?: string;
      };

      if (!payload.success || !payload.data) {
        setError(payload.error ?? "Unable to load compliance profiles.");
        return;
      }

      setData(payload.data);
    } catch {
      setError("Unable to load compliance profiles.");
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin, status]);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchCompliance();
      }
    });
    return () => controller.abort();
  }, [fetchCompliance]);

  const updateKycStatus = useCallback(
    async (
      profileId: string,
      nextStatus: Extract<KycStatus, "UNDER_REVIEW" | "VERIFIED" | "REJECTED">,
      reviewNote?: string,
    ) => {
      setIsUpdating(true);
      const result = await patchJson("/api/admin/compliance", {
        profileId,
        status: nextStatus,
        reviewNote,
      });
      setIsUpdating(false);

      if (!result.success) {
        setError("error" in result ? result.error : "Unable to update KYC status.");
        return false;
      }

      await fetchCompliance();
      return true;
    },
    [fetchCompliance],
  );

  return {
    data,
    error,
    isLoading,
    isForbidden,
    isUpdating,
    refetch: fetchCompliance,
    updateKycStatus,
  };
}
