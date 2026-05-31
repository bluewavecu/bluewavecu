"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import { patchJson } from "@/lib/clientApi";
import type { AdminComplianceData, CustomerProfileRecord, KycStatus } from "@/types/banking";

export type ComplianceStatusFilter = KycStatus | "NEEDS_REVIEW";

export function profileMatchesComplianceFilter(
  kycStatus: KycStatus,
  filter: ComplianceStatusFilter,
) {
  if (filter === "NEEDS_REVIEW") {
    return (
      kycStatus === "NOT_STARTED" ||
      kycStatus === "SUBMITTED" ||
      kycStatus === "UNDER_REVIEW"
    );
  }

  return kycStatus === filter;
}

export function useAdminCompliance(status: ComplianceStatusFilter = "NEEDS_REVIEW") {
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

    const params = new URLSearchParams({ status });

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
        setError("Operations sign-in required.");
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
      const result = await patchJson<{ profile: CustomerProfileRecord }>("/api/admin/compliance", {
        profileId,
        status: nextStatus,
        reviewNote,
      });
      setIsUpdating(false);

      if (!result.success) {
        setError("error" in result ? result.error : "Unable to update KYC status.");
        return false;
      }

      const updatedProfile = result.data.profile;

      setData((current) => {
        if (!current) {
          return current;
        }

        const stillVisible = profileMatchesComplianceFilter(updatedProfile.kycStatus, status);
        const profiles = stillVisible
          ? current.profiles.map((profile) =>
              profile.id === profileId ? updatedProfile : profile,
            )
          : current.profiles.filter((profile) => profile.id !== profileId);

        return {
          ...current,
          profiles,
        };
      });

      void fetchCompliance();

      return true;
    },
    [fetchCompliance, status],
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
