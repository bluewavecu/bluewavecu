"use client";

import { useCallback, useState } from "react";
import { postJson } from "@/lib/clientApi";
import type { TransferData, TransferOtpData, TransferRequestInput } from "@/types/banking";

type TransferState = {
  isSubmitting: boolean;
  isSendingOtp: boolean;
  error: string | null;
  successMessage: string | null;
  otpMessage: string | null;
  otpExpiresAt: string | null;
  requiresTransactionPin: boolean;
  otpRequired: boolean;
  adminSteps: TransferOtpData["adminSteps"];
  adminStepsRequired: boolean;
  verificationRequired: boolean;
  lastTransfer: TransferData | null;
  requestOtp: (input: TransferRequestInput) => Promise<boolean>;
  submitTransfer: (input: TransferRequestInput) => Promise<boolean>;
  reset: () => void;
};

export function useTransfer(): TransferState {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);
  const [requiresTransactionPin, setRequiresTransactionPin] = useState(false);
  const [otpRequired, setOtpRequired] = useState(true);
  const [adminSteps, setAdminSteps] = useState<TransferOtpData["adminSteps"]>([]);
  const [adminStepsRequired, setAdminStepsRequired] = useState(false);
  const [lastTransfer, setLastTransfer] = useState<TransferData | null>(null);

  const verificationRequired = otpRequired || adminStepsRequired;

  const reset = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
    setOtpMessage(null);
    setOtpExpiresAt(null);
    setAdminSteps([]);
    setAdminStepsRequired(false);
    setLastTransfer(null);
  }, []);

  const requestOtp = useCallback(async (input: TransferRequestInput) => {
    setIsSendingOtp(true);
    setError(null);
    setOtpMessage(null);

    const result = await postJson<TransferOtpData>("/api/transfers/otp", input);

    setIsSendingOtp(false);

    if (!result.success) {
      setError(result.error);
      return false;
    }

    setOtpMessage(result.data.message);
    setOtpExpiresAt(result.data.expiresAt);
    setRequiresTransactionPin(result.data.requiresTransactionPin);
    setOtpRequired(result.data.otpRequired);
    setAdminSteps(result.data.adminSteps ?? []);
    setAdminStepsRequired(result.data.adminStepsRequired ?? false);
    return true;
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
    setOtpMessage(null);
    setOtpExpiresAt(null);
    setAdminSteps([]);
    setAdminStepsRequired(false);
    return true;
  }, []);

  return {
    isSubmitting,
    isSendingOtp,
    error,
    successMessage,
    otpMessage,
    otpExpiresAt,
    requiresTransactionPin,
    otpRequired,
    adminSteps,
    adminStepsRequired,
    verificationRequired,
    lastTransfer,
    requestOtp,
    submitTransfer,
    reset,
  };
}
