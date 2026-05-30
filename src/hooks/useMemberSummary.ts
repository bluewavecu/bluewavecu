"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import type { MemberSummary } from "@/types/banking";

export function useMemberSummary() {
  const redirectToLogin = useUnauthorizedRedirect();
  const [summary, setSummary] = useState<MemberSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/member/summary", {
        cache: "no-store",
        credentials: "include",
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const payload = (await response.json()) as {
        success: boolean;
        data?: MemberSummary;
        error?: string;
      };

      if (!payload.success || !payload.data) {
        setError(payload.error ?? "Unable to load member summary.");
        setSummary(null);
        return;
      }

      setSummary(payload.data);
    } catch {
      setError("Unable to load member summary.");
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin]);

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchSummary();
      }
    });

    return () => {
      controller.abort();
    };
  }, [fetchSummary]);

  return { summary, error, isLoading, refetch: fetchSummary };
}
