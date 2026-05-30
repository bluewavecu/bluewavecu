"use client";

import { useCallback, useState } from "react";
import { postJson } from "@/lib/clientApi";
import type { TransferData, TransferRequestInput } from "@/types/banking";

type TransferState = {
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
  lastTransfer: TransferData | null;
  submitTransfer: (input: TransferRequestInput) => Promise<boolean>;
  reset: () => void;
};

export function useTransfer(): TransferState {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastTransfer, setLastTransfer] = useState<TransferData | null>(null);

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

    if (!result.success) {
      setError(result.error);
      setIsSubmitting(false);
      return false;
    }

    setLastTransfer(result.data);
    setSuccessMessage(result.data.message);
    setIsSubmitting(false);
    return true;
  }, []);

  return {
    isSubmitting,
    error,
    successMessage,
    lastTransfer,
    submitTransfer,
    reset,
  };
}
