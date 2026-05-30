"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import { postJson, putJson } from "@/lib/clientApi";
import type { CustomerProfileRecord, ProfileData } from "@/types/banking";

export function useProfile() {
  const redirectToLogin = useUnauthorizedRedirect();
  const [profile, setProfile] = useState<CustomerProfileRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/profile", {
        cache: "no-store",
        credentials: "include",
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const payload = (await response.json()) as {
        success: boolean;
        data?: ProfileData;
        error?: string;
      };

      if (!payload.success || !payload.data) {
        setError(payload.error ?? "Unable to load profile.");
        setProfile(null);
        return;
      }

      setProfile(payload.data.profile);
    } catch {
      setError("Unable to load profile.");
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin]);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchProfile();
      }
    });
    return () => controller.abort();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (input: {
      dateOfBirth?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      employmentStatus?: string;
      annualIncome?: number;
    }) => {
      setIsSaving(true);
      setError(null);
      const result = await putJson<ProfileData>("/api/profile", input);
      setIsSaving(false);

      if (!result.success) {
        setError("error" in result ? result.error : "Unable to update profile.");
        return false;
      }

      setProfile(result.data.profile);
      return true;
    },
    [],
  );

  const submitKyc = useCallback(async () => {
    setIsSubmittingKyc(true);
    setError(null);
    const result = await postJson<ProfileData>("/api/profile", { action: "submit_kyc" });
    setIsSubmittingKyc(false);

    if (!result.success) {
      setError("error" in result ? result.error : "Unable to submit KYC.");
      return false;
    }

    setProfile(result.data.profile);
    return true;
  }, []);

  return {
    profile,
    error,
    isLoading,
    isSaving,
    isSubmittingKyc,
    refetch: fetchProfile,
    updateProfile,
    submitKyc,
  };
}
