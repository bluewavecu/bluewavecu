"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import type { ApiResponse, IdDocumentType, IdVerificationData } from "@/types/banking";

export function useIdVerification() {
  const redirectToLogin = useUnauthorizedRedirect();
  const [data, setData] = useState<IdVerificationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchIdVerification = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/profile/id-verification", {
        cache: "no-store",
        credentials: "include",
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const payload = (await response.json()) as ApiResponse<IdVerificationData>;

      if (!payload.success || !payload.data) {
        setError("error" in payload ? payload.error : "Unable to load ID verification.");
        setData(null);
        return;
      }

      setData(payload.data);
    } catch {
      setError("Unable to load ID verification.");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin]);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchIdVerification();
      }
    });
    return () => controller.abort();
  }, [fetchIdVerification]);

  const submitIdVerification = useCallback(
    async (input: {
      documentType: IdDocumentType;
      frontPhoto: File;
      backPhoto?: File | null;
    }) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("documentType", input.documentType);
        formData.append("frontPhoto", input.frontPhoto);

        if (input.backPhoto) {
          formData.append("backPhoto", input.backPhoto);
        }

        const response = await fetch("/api/profile/id-verification", {
          method: "POST",
          body: formData,
          credentials: "include",
          cache: "no-store",
        });

        if (response.status === 401) {
          redirectToLogin();
          return false;
        }

        const payload = (await response.json()) as ApiResponse<IdVerificationData>;

        if (!payload.success) {
          setError("error" in payload ? payload.error : "Unable to submit ID photos.");
          return false;
        }

        await fetchIdVerification();
        return true;
      } catch {
        setError("Unable to submit ID photos.");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchIdVerification, redirectToLogin],
  );

  return {
    data,
    error,
    isLoading,
    isSubmitting,
    refetch: fetchIdVerification,
    submitIdVerification,
  };
}
