"use client";

import {
  ArrowRight,
  AtSign,
  Briefcase,
  Calendar,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  UserRound,
  WalletCards,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthField, authInputClassName } from "@/components/auth/AuthField";
import { buttonVariants } from "@/components/ui/Button";
import {
  DEFAULT_SIGNUP_ACCOUNT_TYPES,
  SIGNUP_ACCOUNT_TYPE_OPTIONS,
  type SignupAccountType,
} from "@/data/signupAccountTypes";
import { US_STATE_OPTIONS } from "@/data/usStates";
import { postJson } from "@/lib/clientApi";
import { MEMBER_VERIFY_EMAIL_PATH } from "@/lib/authRoutes";
import { cn } from "@/lib/utils";
import type { RegisterResponse } from "@/types/banking";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAccountTypes, setSelectedAccountTypes] = useState<SignupAccountType[]>(
    DEFAULT_SIGNUP_ACCOUNT_TYPES,
  );

  function toggleAccountType(accountType: SignupAccountType, required?: boolean) {
    if (required) {
      return;
    }

    setSelectedAccountTypes((current) =>
      current.includes(accountType)
        ? current.filter((value) => value !== accountType)
        : [...current, accountType],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!selectedAccountTypes.includes("SAVINGS")) {
      setError("A savings account is required for Bluewave membership.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("Passwords must match.");
      return;
    }

    setIsSubmitting(true);

    const result = await postJson<RegisterResponse>("/api/auth/register", {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      username: String(formData.get("username") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
      occupation: String(formData.get("occupation") ?? ""),
      addressLine1: String(formData.get("addressLine1") ?? ""),
      addressLine2: String(formData.get("addressLine2") ?? "") || undefined,
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      postalCode: String(formData.get("postalCode") ?? ""),
      password,
      accountTypes: selectedAccountTypes,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    if ("requiresEmailVerification" in result.data && result.data.requiresEmailVerification) {
      const params = new URLSearchParams({
        username: result.data.username,
        challenge: result.data.verificationChallengeId,
        email: result.data.maskedEmail,
        message: result.data.message,
      });
      router.push(`${MEMBER_VERIFY_EMAIL_PATH}?${params.toString()}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField label="First name" htmlFor="register-first-name" icon={UserRound}>
              <input
                id="register-first-name"
                type="text"
                name="firstName"
                autoComplete="given-name"
                required
                className={authInputClassName}
              />
            </AuthField>
            <AuthField label="Last name" htmlFor="register-last-name" icon={UserRound}>
              <input
                id="register-last-name"
                type="text"
                name="lastName"
                autoComplete="family-name"
                required
                className={authInputClassName}
              />
            </AuthField>
          </div>

          <AuthField label="Username" htmlFor="register-username" icon={AtSign}>
            <input
              id="register-username"
              type="text"
              name="username"
              autoComplete="username"
              required
              minLength={3}
              maxLength={32}
              pattern="[A-Za-z0-9_]{3,32}"
              className={authInputClassName}
            />
            <p className="mt-2 text-xs text-bluewave-gray dark:text-white/[0.58]">
              3–32 characters. Letters, numbers, and underscores only. You&apos;ll use this to sign in.
            </p>
          </AuthField>

          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField label="Email" htmlFor="register-email" icon={Mail}>
              <input
                id="register-email"
                type="email"
                name="email"
                autoComplete="email"
                required
                className={authInputClassName}
              />
            </AuthField>
            <AuthField label="Phone" htmlFor="register-phone" icon={Phone}>
              <input
                id="register-phone"
                type="tel"
                name="phone"
                autoComplete="tel"
                required
                className={authInputClassName}
              />
            </AuthField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField label="Date of birth" htmlFor="register-dob" icon={Calendar}>
              <input
                id="register-dob"
                type="date"
                name="dateOfBirth"
                autoComplete="bday"
                required
                className={authInputClassName}
              />
            </AuthField>
            <AuthField label="Occupation" htmlFor="register-occupation" icon={Briefcase}>
              <input
                id="register-occupation"
                type="text"
                name="occupation"
                autoComplete="organization-title"
                required
                className={authInputClassName}
              />
            </AuthField>
          </div>

          <div className="border-t border-primary-navy/[0.06] pt-6 dark:border-white/[0.06]">
            <AuthField label="Street address" htmlFor="register-address-1" icon={MapPin}>
              <input
                id="register-address-1"
                type="text"
                name="addressLine1"
                autoComplete="address-line1"
                required
                className={authInputClassName}
              />
            </AuthField>

            <div className="mt-4">
              <AuthField
                label="Apt, suite, or unit (optional)"
                htmlFor="register-address-2"
                icon={MapPin}
              >
                <input
                  id="register-address-2"
                  type="text"
                  name="addressLine2"
                  autoComplete="address-line2"
                  className={authInputClassName}
                />
              </AuthField>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <AuthField label="City" htmlFor="register-city" icon={MapPin} className="sm:col-span-1">
                <input
                  id="register-city"
                  type="text"
                  name="city"
                  autoComplete="address-level2"
                  required
                  className={authInputClassName}
                />
              </AuthField>
              <AuthField label="State" htmlFor="register-state" icon={MapPin} className="sm:col-span-1">
                <select
                  id="register-state"
                  name="state"
                  required
                  autoComplete="address-level1"
                  defaultValue=""
                  className={authInputClassName}
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {US_STATE_OPTIONS.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
              </AuthField>
              <AuthField label="ZIP code" htmlFor="register-zip" icon={MapPin} className="sm:col-span-1">
                <input
                  id="register-zip"
                  type="text"
                  name="postalCode"
                  autoComplete="postal-code"
                  required
                  className={authInputClassName}
                />
              </AuthField>
            </div>
          </div>

          <div className="grid gap-4 border-t border-primary-navy/[0.06] pt-6 sm:grid-cols-2 dark:border-white/[0.06]">
            <AuthField label="Password" htmlFor="register-password" icon={LockKeyhole}>
              <input
                id="register-password"
                type="password"
                name="password"
                autoComplete="new-password"
                required
                minLength={8}
                className={authInputClassName}
              />
            </AuthField>
            <AuthField label="Confirm password" htmlFor="register-confirm-password" icon={LockKeyhole}>
              <input
                id="register-confirm-password"
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                required
                minLength={8}
                className={authInputClassName}
              />
            </AuthField>
          </div>
        </div>

        <aside className="rounded-xl border border-primary-navy/[0.08] bg-[#f7fbff] p-5 dark:border-white/[0.08] dark:bg-white/[0.04]">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ocean-blue/15 text-royal-blue dark:text-light-blue">
              <WalletCards size={20} aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-primary-navy dark:text-white">
                Choose your accounts
              </h3>
              <p className="mt-1 text-sm leading-6 text-bluewave-gray dark:text-white/[0.62]">
                Select the account types you want opened with your membership. Savings is required.
                Account numbers are assigned after admin approval.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {SIGNUP_ACCOUNT_TYPE_OPTIONS.map((option) => {
              const checked = selectedAccountTypes.includes(option.value);

              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-lg border p-4 transition",
                    checked
                      ? "border-ocean-blue bg-white shadow-[0_12px_34px_rgba(0,168,232,0.10)] dark:bg-white/[0.06]"
                      : "border-primary-navy/[0.08] bg-white/70 dark:border-white/[0.08] dark:bg-white/[0.03]",
                    option.required && "cursor-default",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={option.required}
                    onChange={() => toggleAccountType(option.value, option.required)}
                    className="mt-1 h-4 w-4 rounded border-primary-navy/20 text-ocean-blue focus:ring-ocean-blue"
                  />
                  <span>
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-primary-navy dark:text-white">
                        {option.label}
                      </span>
                      {option.required ? (
                        <span className="rounded-full bg-ocean-blue/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-royal-blue dark:text-light-blue">
                          Required
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-bluewave-gray dark:text-white/[0.58]">
                      {option.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          <p className="mt-4 text-xs leading-5 text-bluewave-gray dark:text-white/[0.52]">
            Selected accounts appear in online banking right away. Twelve-digit account numbers
            beginning with 33 are issued once member services approves your application.
          </p>
        </aside>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-100"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className={buttonVariants({
          className: "w-full disabled:cursor-not-allowed disabled:opacity-60",
        })}
      >
        {isSubmitting ? "Submitting application..." : "Submit application"}
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </form>
  );
}
