"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import { patchJson } from "@/lib/clientApi";
import type { AdminIdVerificationsData, IdVerificationStatus } from "@/types/banking";

export function useAdminIdVerifications(status?: IdVerificationStatus | "ALL") {
  const redirectToLogin = useUnauthorizedRedirect();
  const [data, setData] = useState<AdminIdVerificationsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsForbidden(false);

    const params = new URLSearchParams();
    if (status && status !== "ALL") {
      params.set("status", status);
    }

    try {
      const response = await fetch(`/api/admin/id-verifications?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });

      const payload = (await response.json()) as {
        success: boolean;
        data?: AdminIdVerificationsData;
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
        setError(payload.error ?? "Unable to load ID verifications.");
        return;
      }

      setData(payload.data);
    } catch {
      setError("Unable to load ID verifications.");
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin, status]);

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchSubmissions();
      }
    });

    return () => {
      controller.abort();
    };
  }, [fetchSubmissions]);

  const reviewSubmission = useCallback(
    async (
      submissionId: string,
      action: "APPROVE" | "REJECT" | "DECLINE",
      reviewNote?: string,
    ) => {
      setIsReviewing(true);
      setError(null);

      const result = await patchJson("/api/admin/id-verifications", {
        submissionId,
        action,
        reviewNote,
      });

      setIsReviewing(false);

      if (!result.success) {
        setError("error" in result ? result.error : "Unable to review ID submission.");
        return false;
      }

      await fetchSubmissions();
      return true;
    },
    [fetchSubmissions],
  );

  return {
    data,
    error,
    isLoading,
    isForbidden,
    isReviewing,
    refetch: fetchSubmissions,
    reviewSubmission,
  };
}
