"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import { postJson } from "@/lib/clientApi";
import type { AdminJobsData, JobStatus, WorkerRunSummary } from "@/types/banking";

export function useAdminJobs(status?: JobStatus | "ALL", jobType?: string) {
  const redirectToLogin = useUnauthorizedRedirect();
  const [data, setData] = useState<AdminJobsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runSummary, setRunSummary] = useState<WorkerRunSummary | null>(null);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsForbidden(false);

    const params = new URLSearchParams();
    if (status && status !== "ALL") {
      params.set("status", status);
    }
    if (jobType && jobType !== "ALL") {
      params.set("jobType", jobType);
    }

    try {
      const response = await fetch(`/api/admin/jobs?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });

      const payload = (await response.json()) as {
        success: boolean;
        data?: AdminJobsData;
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
        setError(payload.error ?? "Unable to load jobs.");
        return;
      }

      setData(payload.data);
    } catch {
      setError("Unable to load jobs.");
    } finally {
      setIsLoading(false);
    }
  }, [jobType, redirectToLogin, status]);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchJobs();
      }
    });
    return () => controller.abort();
  }, [fetchJobs]);

  const runDueJobs = useCallback(async () => {
    setIsRunning(true);
    setError(null);
    const result = await postJson<WorkerRunSummary>("/api/admin/jobs/run", {});
    setIsRunning(false);

    if (!result.success) {
      setError("error" in result ? result.error : "Unable to run jobs.");
      return null;
    }

    if (!result.data) {
      setError("Unable to run jobs.");
      return null;
    }

    setRunSummary(result.data);
    await fetchJobs();
    return result.data;
  }, [fetchJobs]);

  return {
    data,
    error,
    isLoading,
    isForbidden,
    isRunning,
    runSummary,
    refetch: fetchJobs,
    runDueJobs,
  };
}
