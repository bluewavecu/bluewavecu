"use client";

import { useCallback, useEffect, useState } from "react";
import { notifyProfilePhotoUpdated } from "@/components/profile/ProfilePhotoUpload";
import { useUnauthorizedRedirect } from "@/hooks/useUnauthorizedRedirect";
import { postJson, putJson } from "@/lib/clientApi";
import { withPhotoCacheBuster } from "@/lib/memberAvatar";
import type { ApiResponse, CustomerProfileRecord, ProfileData } from "@/types/banking";

type ProfilePhotoData = {
  profilePhotoUrl: string | null;
};

export function useProfile() {
  const redirectToLogin = useUnauthorizedRedirect();
  const [profile, setProfile] = useState<CustomerProfileRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false);

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

  const uploadPhoto = useCallback(async (file: File) => {
    setIsUploadingPhoto(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch("/api/profile/photo", {
        method: "POST",
        body: formData,
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401) {
        redirectToLogin();
        return false;
      }

      const payload = (await response.json()) as ApiResponse<ProfilePhotoData>;

      if (!payload.success || !payload.data) {
        setError("error" in payload ? payload.error : "Unable to upload photo.");
        return false;
      }

      const profilePhotoUrl = withPhotoCacheBuster(
        payload.data.profilePhotoUrl,
        String(Date.now()),
      );

      setProfile((current) =>
        current
          ? {
              ...current,
              profilePhotoUrl,
              updatedAt: new Date().toISOString(),
            }
          : current,
      );
      notifyProfilePhotoUpdated(profilePhotoUrl);
      return true;
    } catch {
      setError("Unable to upload photo.");
      return false;
    } finally {
      setIsUploadingPhoto(false);
    }
  }, [redirectToLogin]);

  const removePhoto = useCallback(async () => {
    setIsRemovingPhoto(true);
    setError(null);

    try {
      const response = await fetch("/api/profile/photo", {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401) {
        redirectToLogin();
        return false;
      }

      const payload = (await response.json()) as ApiResponse<ProfilePhotoData>;

      if (!payload.success) {
        setError("error" in payload ? payload.error : "Unable to remove photo.");
        return false;
      }

      setProfile((current) =>
        current
          ? {
              ...current,
              profilePhotoUrl: null,
              updatedAt: new Date().toISOString(),
            }
          : current,
      );
      notifyProfilePhotoUpdated(null);
      return true;
    } catch {
      setError("Unable to remove photo.");
      return false;
    } finally {
      setIsRemovingPhoto(false);
    }
  }, [redirectToLogin]);

  return {
    profile,
    error,
    isLoading,
    isSaving,
    isSubmittingKyc,
    isUploadingPhoto,
    isRemovingPhoto,
    refetch: fetchProfile,
    updateProfile,
    submitKyc,
    uploadPhoto,
    removePhoto,
  };
}
