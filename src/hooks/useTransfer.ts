"use client";

import { useCallback, useEffect, useState } from "react";
import { postJson } from "@/lib/clientApi";
import type { TransferData, TransferRequirementsData, TransferRequestInput } from "@/types/banking";

type TransferState = {
  isSubmitting: boolean;
  isLoadingRequirements: boolean;
  error: string | null;
  successMessage: string | null;
  hasTransactionPin: boolean;
  lastTransfer: TransferData | null;
  submitTransfer: (input: TransferRequestInput) => Promise<boolean>;
  reset: () => void;
};

export function useTransfer(): TransferState {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasTransactionPin, setHasTransactionPin] = useState(false);
  const [lastTransfer, setLastTransfer] = useState<TransferData | null>(null);

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
    setSuccessMessage(null);
    setLastTransfer(null);
  }, []);

  const submitTransfer = useCallback(async (input: TransferRequestInput) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const result = await postJson<TransferData>("/api/transfers", input);

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return false;
    }

    setLastTransfer(result.data);
    setSuccessMessage(result.data.message);
    return true;
  }, []);

  return {
    isSubmitting,
    isLoadingRequirements,
    error,
    successMessage,
    hasTransactionPin,
    lastTransfer,
    submitTransfer,
    reset,
  };
}
