"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import { patchJson } from "@/lib/clientApi";
import type { AdminCardApplicationsData, CardApplicationStatus } from "@/types/banking";

export function useAdminCardApplications(status?: CardApplicationStatus | "ALL") {
  const redirectToLogin = useUnauthorizedRedirect();
  const [data, setData] = useState<AdminCardApplicationsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsForbidden(false);

    const params = new URLSearchParams();
    if (status && status !== "ALL") {
      params.set("status", status);
    }

    try {
      const response = await fetch(`/api/admin/card-applications?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });

      const payload = (await response.json()) as {
        success: boolean;
        data?: AdminCardApplicationsData;
        error?: string;
      };

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (response.status === 403) {
        setIsForbidden(true);
        setError("Operations sign-in required.");
        return;
      }

      if (!payload.success || !payload.data) {
        setError(payload.error ?? "Unable to load card applications.");
        return;
      }

      setData(payload.data);
    } catch {
      setError("Unable to load card applications.");
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin, status]);

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchApplications();
      }
    });

    return () => {
      controller.abort();
    };
  }, [fetchApplications]);

  const reviewApplication = useCallback(
    async (applicationId: string, action: "APPROVE" | "DECLINE", reviewNote?: string) => {
      setIsReviewing(true);
      setError(null);

      const result = await patchJson("/api/admin/card-applications", {
        applicationId,
        action,
        reviewNote,
      });

      setIsReviewing(false);

      if (!result.success) {
        setError(result.error ?? "Unable to review card application.");
        return false;
      }

      await fetchApplications();
      return true;
    },
    [fetchApplications],
  );

  return {
    data,
    error,
    isLoading,
    isForbidden,
    isReviewing,
    refetch: fetchApplications,
    reviewApplication,
  };
}
