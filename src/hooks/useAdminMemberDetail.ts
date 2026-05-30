"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import type { AdminMemberDetailData, ApiResponse } from "@/types/banking";

export function useAdminMemberDetail(memberId: string | null) {
  const redirectToLogin = useUnauthorizedRedirect();
  const [data, setData] = useState<AdminMemberDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      if (!memberId) {
        setData(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/members/${memberId}`, {
          cache: "no-store",
          credentials: "include",
          signal,
        });
        const payload = (await response.json()) as ApiResponse<AdminMemberDetailData>;

        if (response.status === 401 || (!payload.success && payload.error === "Unauthorized")) {
          redirectToLogin();
          return;
        }

        if (!payload.success) {
          setError(payload.error);
          setData(null);
          return;
        }

        setData(payload.data);
      } catch (fetchError) {
        if (!signal?.aborted) {
          setError(fetchError instanceof Error ? fetchError.message : "Unable to load member detail.");
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [memberId, redirectToLogin],
  );

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchData(controller.signal);
      }
    });

    return () => controller.abort();
  }, [fetchData]);

  return { data, error, isLoading, refetch: () => fetchData() };
}
