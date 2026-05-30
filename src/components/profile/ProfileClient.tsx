"use client";

import Link from "next/link";
import { useState } from "react";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";
import type { CustomerProfileRecord, KycStatus } from "@/types/banking";

type ProfileFormState = {
  dateOfBirth: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  employmentStatus: string;
  annualIncome: string;
};

function profileToForm(profile: CustomerProfileRecord): ProfileFormState {
  return {
    dateOfBirth: profile.dateOfBirth ?? "",
    addressLine1: profile.addressLine1 ?? "",
    addressLine2: profile.addressLine2 ?? "",
    city: profile.city ?? "",
    state: profile.state ?? "",
    postalCode: profile.postalCode ?? "",
    country: profile.country ?? "US",
    employmentStatus: profile.employmentStatus ?? "",
    annualIncome: profile.annualIncome !== null ? String(profile.annualIncome) : "",
  };
}

function kycBadgeClass(status: KycStatus) {
  if (status === "VERIFIED") {
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  }

  if (status === "REJECTED") {
    return "bg-red-500/15 text-red-700 dark:text-red-300";
  }

  if (status === "SUBMITTED" || status === "UNDER_REVIEW") {
    return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
  }

  return "bg-primary-navy/10 text-primary-navy dark:bg-white/10 dark:text-white";
}

export function ProfileClient() {
  const { profile, error, isLoading, isSaving, isSubmittingKyc, updateProfile, submitKyc } =
    useProfile();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProfileFormState | null>(null);

  if (isLoading) {
    return <LoadingState title="Loading profile" message="Retrieving your profile and KYC status." />;
  }

  if (error && !profile) {
    return <ApiErrorState message={error} />;
  }

  if (!profile) {
    return null;
  }

  const form = draft ?? profileToForm(profile);
  const canSubmitKyc =
    profile.kycStatus === "NOT_STARTED" || profile.kycStatus === "REJECTED";

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSuccessMessage(null);

    const ok = await updateProfile({
      dateOfBirth: form.dateOfBirth || undefined,
      addressLine1: form.addressLine1 || undefined,
      addressLine2: form.addressLine2 || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      postalCode: form.postalCode || undefined,
      country: form.country || undefined,
      employmentStatus: form.employmentStatus || undefined,
      annualIncome: form.annualIncome ? Number(form.annualIncome) : undefined,
    });

    if (ok) {
      setDraft(null);
      setSuccessMessage("Profile saved successfully.");
    }
  }

  async function handleSubmitKyc() {
    setSuccessMessage(null);
    const ok = await submitKyc();

    if (ok) {
      setDraft(null);
      setSuccessMessage("KYC profile submitted for review.");
    }
  }

  return (
    <section className="grid gap-5">
      <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
              Identity verification
            </h2>
            <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.62]">
              Complete your profile and submit KYC for compliance review.
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold uppercase",
              kycBadgeClass(profile.kycStatus),
            )}
          >
            {profile.kycStatus.replaceAll("_", " ")}
          </span>
        </div>

        {profile.kycReviewNote ? (
          <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            Review note: {profile.kycReviewNote}
          </p>
        ) : null}
      </article>

      <form
        onSubmit={(event) => void handleSave(event)}
        className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]"
      >
        <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Profile details</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold">Date of birth</span>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(event) =>
                setDraft((current) => ({
                  ...(current ?? profileToForm(profile)),
                  dateOfBirth: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Employment status</span>
            <input
              value={form.employmentStatus}
              onChange={(event) =>
                setDraft((current) => ({
                  ...(current ?? profileToForm(profile)),
                  employmentStatus: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-semibold">Address line 1</span>
            <input
              value={form.addressLine1}
              onChange={(event) =>
                setDraft((current) => ({
                  ...(current ?? profileToForm(profile)),
                  addressLine1: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-semibold">Address line 2</span>
            <input
              value={form.addressLine2}
              onChange={(event) =>
                setDraft((current) => ({
                  ...(current ?? profileToForm(profile)),
                  addressLine2: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">City</span>
            <input
              value={form.city}
              onChange={(event) =>
                setDraft((current) => ({
                  ...(current ?? profileToForm(profile)),
                  city: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">State</span>
            <input
              value={form.state}
              onChange={(event) =>
                setDraft((current) => ({
                  ...(current ?? profileToForm(profile)),
                  state: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Postal code</span>
            <input
              value={form.postalCode}
              onChange={(event) =>
                setDraft((current) => ({
                  ...(current ?? profileToForm(profile)),
                  postalCode: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Country</span>
            <input
              value={form.country}
              onChange={(event) =>
                setDraft((current) => ({
                  ...(current ?? profileToForm(profile)),
                  country: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Annual income (USD)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.annualIncome}
              onChange={(event) =>
                setDraft((current) => ({
                  ...(current ?? profileToForm(profile)),
                  annualIncome: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            />
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-red-700 dark:text-red-300">{error}</p> : null}
        {successMessage ? (
          <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-300">{successMessage}</p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex h-11 items-center rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy disabled:opacity-70"
          >
            {isSaving ? "Saving..." : "Save profile"}
          </button>

          {canSubmitKyc ? (
            <button
              type="button"
              disabled={isSubmittingKyc}
              onClick={() => void handleSubmitKyc()}
              className="inline-flex h-11 items-center rounded-full border border-primary-navy/[0.12] px-5 text-sm font-semibold text-primary-navy dark:border-white/[0.12] dark:text-white"
            >
              {isSubmittingKyc ? "Submitting..." : "Submit for KYC review"}
            </button>
          ) : null}
        </div>
      </form>

      <p className="text-sm text-bluewave-gray dark:text-white/[0.62]">
        Need help? Visit <Link href="/support" className="font-semibold text-royal-blue">Support</Link>.
      </p>
    </section>
  );
}
