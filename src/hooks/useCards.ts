"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiResponse, CardsData } from "@/types/banking";

type CardsState = {
  data: CardsData | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

export function useCards(): CardsState {
  const router = useRouter();
  const [data, setData] = useState<CardsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCards = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/cards", {
          cache: "no-store",
          credentials: "include",
          signal,
        });
        const payload = (await response.json()) as ApiResponse<CardsData>;

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
            : "Unable to load authenticated card data.",
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
    await fetchCards();
  }, [fetchCards]);

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchCards(controller.signal);
      }
    });

    return () => {
      controller.abort();
    };
  }, [fetchCards]);

  return {
    data,
    error,
    isLoading,
    refetch,
  };
}
