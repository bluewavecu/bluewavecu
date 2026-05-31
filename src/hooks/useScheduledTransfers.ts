"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import { patchJson, postJson } from "@/lib/clientApi";
import type {
  MfaSettingRecord,
  ScheduledTransferRecord,
  UserSessionRecord,
} from "@/types/banking";

export function useScheduledTransfers() {
  const redirectToLogin = useUnauthorizedRedirect();
  const [scheduledTransfers, setScheduledTransfers] = useState<ScheduledTransferRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchScheduledTransfers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/scheduled-transfers", {
        cache: "no-store",
        credentials: "include",
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const payload = (await response.json()) as {
        success: boolean;
        data?: { scheduledTransfers: ScheduledTransferRecord[] };
        error?: string;
      };

      if (!payload.success || !payload.data) {
        setError(payload.error ?? "Unable to load scheduled transfers.");
        setScheduledTransfers([]);
        return;
      }

      setScheduledTransfers(payload.data.scheduledTransfers);
    } catch {
      setError("Unable to load scheduled transfers.");
      setScheduledTransfers([]);
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin]);

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchScheduledTransfers();
      }
    });

    return () => controller.abort();
  }, [fetchScheduledTransfers]);

  const createScheduledTransfer = useCallback(
    async (input: {
      fromAccountId: string;
      recipientName?: string;
      destinationAccountNumber?: string;
      amount: number;
      memo?: string;
      frequency: ScheduledTransferRecord["frequency"];
      scheduledFor: string;
    }) => {
      setIsSubmitting(true);
      setError(null);

      const result = await postJson<{ message: string }>("/api/scheduled-transfers", input);

      setIsSubmitting(false);

      if (!result.success) {
        setError(result.error);
        return false;
      }

      await fetchScheduledTransfers();
      return true;
    },
    [fetchScheduledTransfers],
  );

  const updateScheduledTransfer = useCallback(
    async (id: string, status: "ACTIVE" | "PAUSED" | "CANCELLED") => {
      setIsSubmitting(true);
      setError(null);

      const result = await patchJson<{ message: string }>(`/api/scheduled-transfers/${id}`, {
        status,
      });

      setIsSubmitting(false);

      if (!result.success) {
        setError(result.error);
        return false;
      }

      await fetchScheduledTransfers();
      return true;
    },
    [fetchScheduledTransfers],
  );

  return {
    scheduledTransfers,
    error,
    isLoading,
    isSubmitting,
    refetch: fetchScheduledTransfers,
    createScheduledTransfer,
    updateScheduledTransfer,
  };
}

export function useUserSessions() {
  const redirectToLogin = useUnauthorizedRedirect();
  const [sessions, setSessions] = useState<UserSessionRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState(false);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/sessions", {
        cache: "no-store",
        credentials: "include",
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const payload = (await response.json()) as {
        success: boolean;
        data?: { sessions: UserSessionRecord[] };
        error?: string;
      };

      if (!payload.success || !payload.data) {
        setError(payload.error ?? "Unable to load sessions.");
        setSessions([]);
        return;
      }

      setSessions(payload.data.sessions);
    } catch {
      setError("Unable to load sessions.");
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin]);

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchSessions();
      }
    });

    return () => controller.abort();
  }, [fetchSessions]);

  const revokeSession = useCallback(
    async (sessionId: string) => {
      setIsRevoking(true);
      setError(null);

      const result = await postJson<{ loggedOut: boolean }>("/api/sessions/revoke", {
        sessionId,
      });

      setIsRevoking(false);

      if (!result.success) {
        setError(result.error);
        return false;
      }

      if (result.data?.loggedOut) {
        window.location.href = "/auth/login?next=/auth/security";
        return true;
      }

      await fetchSessions();
      return true;
    },
    [fetchSessions],
  );

  return {
    sessions,
    error,
    isLoading,
    isRevoking,
    refetch: fetchSessions,
    revokeSession,
  };
}

export function useMfaSettings() {
  const redirectToLogin = useUnauthorizedRedirect();
  const [settings, setSettings] = useState<MfaSettingRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/mfa/settings", {
        cache: "no-store",
        credentials: "include",
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const payload = (await response.json()) as {
        success: boolean;
        data?: { settings: MfaSettingRecord[] };
        error?: string;
      };

      if (!payload.success || !payload.data) {
        setError(payload.error ?? "Unable to load MFA settings.");
        setSettings([]);
        return;
      }

      setSettings(payload.data.settings);
    } catch {
      setError("Unable to load MFA settings.");
      setSettings([]);
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin]);

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchSettings();
      }
    });

    return () => controller.abort();
  }, [fetchSettings]);

  const toggleEmailMfa = useCallback(
    async (enabled: boolean) => {
      setIsUpdating(true);
      setError(null);

      const result = await postJson<{ setting: MfaSettingRecord }>("/api/mfa/toggle", {
        method: "EMAIL",
        enabled,
      });

      setIsUpdating(false);

      if (!result.success) {
        setError(result.error);
        return false;
      }

      await fetchSettings();
      return true;
    },
    [fetchSettings],
  );

  return {
    settings,
    error,
    isLoading,
    isUpdating,
    refetch: fetchSettings,
    toggleEmailMfa,
  };
}
