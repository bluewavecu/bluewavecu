"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import { patchJson, postJson } from "@/lib/clientApi";
import type {
  AdminCreateMemberResponse,
  AdminUserFilters,
  AdminUserSummary,
  AdminUsersData,
  ApiResponse,
  UserStatus,
} from "@/types/banking";
import type { AdminCreateMemberInput } from "@/lib/validators";

type AdminManageUserInput = {
  userId: string;
  status?: UserStatus;
  statusNote?: string;
  transactionsUnrestricted?: boolean;
  action?: "REINSTATE" | "DELETE" | "GENERATE_TRANSACTION_PIN" | "CLEAR_TRANSACTION_PIN";
};

type AdminUsersState = {
  data: AdminUsersData | null;
  error: string | null;
  isLoading: boolean;
  isForbidden: boolean;
  isUpdating: boolean;
  isCreating: boolean;
  updateError: string | null;
  createError: string | null;
  createSuccess: string | null;
  refetch: () => Promise<void>;
  updateUserStatus: (userId: string, status: UserStatus) => Promise<boolean>;
  manageUser: (input: AdminManageUserInput) => Promise<boolean>;
  createUser: (input: AdminCreateMemberInput) => Promise<boolean>;
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

  if (filters?.kycStatus) {
    params.set("kycStatus", filters.kycStatus);
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
  const [isCreating, setIsCreating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
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
          setError("Operations sign-in required.");
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

  const manageUser = useCallback(async (input: AdminManageUserInput) => {
    setIsUpdating(true);
    setUpdateError(null);

    const result = await patchJson<{ user: AdminUserSummary }>("/api/admin/users", input);

    if (!result.success) {
      setUpdateError(result.error);
      setIsUpdating(false);
      return false;
    }

    setData((current) =>
      current
        ? {
            users: current.users.map((user) =>
              user.id === input.userId ? { ...user, ...result.data.user } : user,
            ),
          }
        : current,
    );
    setIsUpdating(false);
    return true;
  }, []);

  const updateUserStatus = useCallback(
    async (userId: string, status: UserStatus) => manageUser({ userId, status }),
    [manageUser],
  );

  const createUser = useCallback(
    async (input: AdminCreateMemberInput) => {
      setIsCreating(true);
      setCreateError(null);
      setCreateSuccess(null);

      const result = await postJson<AdminCreateMemberResponse>("/api/admin/users", input);

      if (!result.success) {
        setCreateError(result.error);
        setIsCreating(false);
        return false;
      }

      setCreateSuccess(result.data.message);
      await fetchUsers();
      setIsCreating(false);
      return true;
    },
    [fetchUsers],
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
    isCreating,
    updateError,
    createError,
    createSuccess,
    refetch,
    updateUserStatus,
    manageUser,
    createUser,
  };
}
