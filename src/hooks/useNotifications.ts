"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import { postJson } from "@/lib/clientApi";
import type {
  ActivityTimelineItem,
  AdminOperationalAlert,
  NotificationsData,
} from "@/types/banking";

type NotificationsState = {
  data: NotificationsData | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
  markRead: (notificationId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
};

export function useNotifications(limit = 10): NotificationsState {
  const redirectToLogin = useUnauthorizedRedirect();
  const [data, setData] = useState<NotificationsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/notifications?limit=${limit}`, {
          cache: "no-store",
          credentials: "include",
          signal,
        });

        if (response.status === 401) {
          redirectToLogin();
          return;
        }

        const payload = (await response.json()) as {
          success: boolean;
          data?: NotificationsData;
          error?: string;
        };

        if (!payload.success || !payload.data) {
          setError(payload.error ?? "Unable to load notifications.");
          setData(null);
          return;
        }

        setData(payload.data);
      } catch (fetchError) {
        if (signal?.aborted) {
          return;
        }

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load notifications.",
        );
        setData(null);
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [limit, redirectToLogin],
  );

  const refetch = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  const markRead = useCallback(async (notificationId: string) => {
    const result = await postJson("/api/notifications/read", { notificationId });

    if (!result.success) {
      return;
    }

    setData((current) =>
      current
        ? {
            unreadCount: Math.max(0, current.unreadCount - 1),
            notifications: current.notifications.map((notification) =>
              notification.id === notificationId
                ? { ...notification, isRead: true }
                : notification,
            ),
          }
        : current,
    );
  }, []);

  const markAllRead = useCallback(async () => {
    const result = await postJson("/api/notifications/read", { markAll: true });

    if (!result.success) {
      return;
    }

    setData((current) =>
      current
        ? {
            unreadCount: 0,
            notifications: current.notifications.map((notification) => ({
              ...notification,
              isRead: true,
            })),
          }
        : current,
    );
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchNotifications(controller.signal);
      }
    });

    return () => {
      controller.abort();
    };
  }, [fetchNotifications]);

  return {
    data,
    error,
    isLoading,
    refetch,
    markRead,
    markAllRead,
  };
}

export function useAccountActivity(accountId?: string, limit = 12) {
  const redirectToLogin = useUnauthorizedRedirect();
  const [items, setItems] = useState<ActivityTimelineItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivity = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({ limit: String(limit) });

      if (accountId) {
        params.set("accountId", accountId);
      }

      try {
        const response = await fetch(`/api/activity?${params.toString()}`, {
          cache: "no-store",
          credentials: "include",
          signal,
        });

        if (response.status === 401) {
          redirectToLogin();
          return;
        }

        const payload = (await response.json()) as {
          success: boolean;
          data?: { items: ActivityTimelineItem[] };
          error?: string;
        };

        if (!payload.success || !payload.data) {
          setError(payload.error ?? "Unable to load account activity.");
          setItems([]);
          return;
        }

        setItems(payload.data.items);
      } catch (fetchError) {
        if (signal?.aborted) {
          return;
        }

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load account activity.",
        );
        setItems([]);
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [accountId, limit, redirectToLogin],
  );

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchActivity(controller.signal);
      }
    });

    return () => {
      controller.abort();
    };
  }, [fetchActivity]);

  return {
    items,
    error,
    isLoading,
    refetch: () => fetchActivity(),
  };
}

export function useAdminOperationalAlerts() {
  const redirectToLogin = useUnauthorizedRedirect();
  const [alerts, setAlerts] = useState<AdminOperationalAlert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);

  const fetchAlerts = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);
      setIsForbidden(false);

      try {
        const response = await fetch("/api/admin/notifications", {
          cache: "no-store",
          credentials: "include",
          signal,
        });

        const payload = (await response.json()) as {
          success: boolean;
          data?: { alerts: AdminOperationalAlert[] };
          error?: string;
        };

        if (response.status === 401 || (!payload.success && payload.error === "Unauthorized")) {
          redirectToLogin();
          return;
        }

        if (response.status === 403 || (!payload.success && payload.error === "Forbidden")) {
          setIsForbidden(true);
          setError("Admin access required.");
          return;
        }

        if (!payload.success || !payload.data) {
          setError(payload.error ?? "Unable to load operational alerts.");
          return;
        }

        setAlerts(payload.data.alerts);
      } catch (fetchError) {
        if (signal?.aborted) {
          return;
        }

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load operational alerts.",
        );
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [redirectToLogin],
  );

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchAlerts(controller.signal);
      }
    });

    return () => {
      controller.abort();
    };
  }, [fetchAlerts]);

  return {
    alerts,
    error,
    isLoading,
    isForbidden,
    refetch: () => fetchAlerts(),
  };
}
