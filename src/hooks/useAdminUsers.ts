"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import { patchJson } from "@/lib/clientApi";
import type {
  AdminUserFilters,
  AdminUserSummary,
  AdminUsersData,
  ApiResponse,
  UserStatus,
} from "@/types/banking";

type AdminUsersState = {
  data: AdminUsersData | null;
  error: string | null;
  isLoading: boolean;
  isForbidden: boolean;
  isUpdating: boolean;
  updateError: string | null;
  refetch: () => Promise<void>;
  updateUserStatus: (userId: string, status: UserStatus) => Promise<boolean>;
};

function buildUsersUrl(filters?: AdminUserFilters) {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.set("status", filters.status);
  }

  if (filters?.role) {
    params.set("role", filters.role);
  }

  if (filters?.search) {
    params.set("search", filters.search);
  }

  const query = params.toString();
  return query ? `/api/admin/users?${query}` : "/api/admin/users";
}

export function useAdminUsers(filters?: AdminUserFilters): AdminUsersState {
  const redirectToLogin = useUnauthorizedRedirect();
  const [data, setData] = useState<AdminUsersData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const requestUrl = useMemo(() => buildUsersUrl(filters), [filters]);

  const fetchUsers = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);
      setIsForbidden(false);

      try {
        const response = await fetch(requestUrl, {
          cache: "no-store",
          credentials: "include",
          signal,
        });
        const payload = (await response.json()) as ApiResponse<AdminUsersData>;

        if (response.status === 401 || (!payload.success && payload.error === "Unauthorized")) {
          setData(null);
          redirectToLogin();
          return;
        }

        if (response.status === 403 || (!payload.success && payload.error === "Forbidden")) {
          setData(null);
          setIsForbidden(true);
          setError("Admin access required.");
          return;
        }

        if (!payload.success) {
          setError(payload.error);
          setData(null);
          return;
        }

        setData(payload.data);
      } catch (fetchError) {
        if (signal?.aborted) {
          return;
        }

        setData(null);
        setError(
          fetchError instanceof Error ? fetchError.message : "Unable to load admin users.",
        );
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [requestUrl, redirectToLogin],
  );

  const refetch = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  const updateUserStatus = useCallback(
    async (userId: string, status: UserStatus) => {
      setIsUpdating(true);
      setUpdateError(null);

      const result = await patchJson<{ user: AdminUserSummary }>("/api/admin/users", {
        userId,
        status,
      });

      if (!result.success) {
        setUpdateError(result.error);
        setIsUpdating(false);
        return false;
      }

      setData((current) =>
        current
          ? {
              users: current.users.map((user) =>
                user.id === userId ? result.data.user : user,
              ),
            }
          : current,
      );
      setIsUpdating(false);
      return true;
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchUsers(controller.signal);
      }
    });

    return () => {
      controller.abort();
    };
  }, [fetchUsers]);

  return {
    data,
    error,
    isLoading,
    isForbidden,
    isUpdating,
    updateError,
    refetch,
    updateUserStatus,
  };
}
