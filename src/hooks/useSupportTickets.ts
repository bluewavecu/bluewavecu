"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { postJson } from "@/lib/clientApi";
import type {
  ApiResponse,
  CreateSupportTicketInput,
  PageSupportTicket,
  SupportTicketsData,
} from "@/types/banking";

type SupportTicketsState = {
  data: SupportTicketsData | null;
  error: string | null;
  isLoading: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  refetch: () => Promise<void>;
  createTicket: (input: CreateSupportTicketInput) => Promise<PageSupportTicket | null>;
};

export function useSupportTickets(): SupportTicketsState {
  const router = useRouter();
  const [data, setData] = useState<SupportTicketsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchTickets = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/support", {
          cache: "no-store",
          credentials: "include",
          signal,
        });
        const payload = (await response.json()) as ApiResponse<SupportTicketsData>;

        if (response.status === 401 || (!payload.success && payload.error === "Unauthorized")) {
          setData(null);
          router.replace("/login");
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
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load authenticated support tickets.",
        );
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [router],
  );

  const refetch = useCallback(async () => {
    await fetchTickets();
  }, [fetchTickets]);

  const createTicket = useCallback(
    async (input: CreateSupportTicketInput) => {
      setIsSubmitting(true);
      setSubmitError(null);

      const result = await postJson<{ ticket: PageSupportTicket }>("/api/support", input);

      if (!result.success) {
        setSubmitError(result.error);
        setIsSubmitting(false);
        return null;
      }

      setData((current) => ({
        tickets: [result.data.ticket, ...(current?.tickets ?? [])],
      }));
      setIsSubmitting(false);
      return result.data.ticket;
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchTickets(controller.signal);
      }
    });

    return () => {
      controller.abort();
    };
  }, [fetchTickets]);

  return {
    data,
    error,
    isLoading,
    isSubmitting,
    submitError,
    refetch,
    createTicket,
  };
}
