"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { patchJson } from "@/lib/clientApi";
import type {
  AdminSupportData,
  AdminSupportFilters,
  AdminSupportTicketRecord,
  ApiResponse,
  SupportTicketStatus,
} from "@/types/banking";

type AdminSupportState = {
  data: AdminSupportData | null;
  error: string | null;
  isLoading: boolean;
  isForbidden: boolean;
  isUpdating: boolean;
  updateError: string | null;
  refetch: () => Promise<void>;
  updateTicketStatus: (ticketId: string, status: SupportTicketStatus) => Promise<boolean>;
};

function buildSupportUrl(filters?: AdminSupportFilters) {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.set("status", filters.status);
  }

  if (filters?.priority) {
    params.set("priority", filters.priority);
  }

  const query = params.toString();
  return query ? `/api/admin/support?${query}` : "/api/admin/support";
}

export function useAdminSupport(filters?: AdminSupportFilters): AdminSupportState {
  const router = useRouter();
  const [data, setData] = useState<AdminSupportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForbidden, setIsForbidden] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const requestUrl = useMemo(() => buildSupportUrl(filters), [filters]);

  const fetchSupport = useCallback(
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
        const payload = (await response.json()) as ApiResponse<AdminSupportData>;

        if (response.status === 401 || (!payload.success && payload.error === "Unauthorized")) {
          setData(null);
          router.replace("/login");
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
          fetchError instanceof Error ? fetchError.message : "Unable to load admin support tickets.",
        );
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [requestUrl, router],
  );

  const refetch = useCallback(async () => {
    await fetchSupport();
  }, [fetchSupport]);

  const updateTicketStatus = useCallback(
    async (ticketId: string, status: SupportTicketStatus) => {
      setIsUpdating(true);
      setUpdateError(null);

      const result = await patchJson<{ ticket: AdminSupportTicketRecord }>("/api/admin/support", {
        ticketId,
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
              tickets: current.tickets.map((ticket) =>
                ticket.id === ticketId ? result.data.ticket : ticket,
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
        void fetchSupport(controller.signal);
      }
    });

    return () => {
      controller.abort();
    };
  }, [fetchSupport]);

  return {
    data,
    error,
    isLoading,
    isForbidden,
    isUpdating,
    updateError,
    refetch,
    updateTicketStatus,
  };
}
