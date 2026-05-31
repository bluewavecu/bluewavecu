"use client";

import { useCallback, useEffect, useState } from "react";
import { postJson } from "@/lib/clientApi";
import type { TransferData, TransferRequirementsData, TransferRequestInput } from "@/types/banking";

type TransferSubmitResult =
  | { ok: true; data: TransferData }
  | { ok: false; error: string };

type TransferState = {
  isSubmitting: boolean;
  isLoadingRequirements: boolean;
  error: string | null;
  hasTransactionPin: boolean;
  submitTransfer: (input: TransferRequestInput) => Promise<TransferSubmitResult>;
  reset: () => void;
};

export function useTransfer(): TransferState {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasTransactionPin, setHasTransactionPin] = useState(false);

  const loadRequirements = useCallback(async () => {
    setIsLoadingRequirements(true);

    try {
      const response = await fetch("/api/transfers/requirements", {
        credentials: "include",
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        success: boolean;
        data?: TransferRequirementsData;
        error?: string;
      };

      if (payload.success && payload.data) {
        setHasTransactionPin(payload.data.hasTransactionPin);
      }
    } finally {
      setIsLoadingRequirements(false);
    }
  }, []);

  useEffect(() => {
    void loadRequirements();
  }, [loadRequirements]);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const submitTransfer = useCallback(async (input: TransferRequestInput): Promise<TransferSubmitResult> => {
    setIsSubmitting(true);
    setError(null);

    const result = await postJson<TransferData>("/api/transfers", input);

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return { ok: false, error: result.error };
    }

    return { ok: true, data: result.data };
  }, []);

  return {
    isSubmitting,
    isLoadingRequirements,
    error,
    hasTransactionPin,
    submitTransfer,
    reset,
  };
}
