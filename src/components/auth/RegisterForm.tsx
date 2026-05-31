"use client";

import {
  ArrowRight,
  AtSign,
  Briefcase,
  Calendar,
  DollarSign,
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
import { PasswordInput } from "@/components/auth/PasswordInput";
import { MathChallengeField } from "@/components/shared/MathChallengeField";
import { buttonVariants } from "@/components/ui/Button";
import {
  DEFAULT_SIGNUP_ACCOUNT_SELECTION,
  SIGNUP_ACCOUNT_SELECTION_OPTIONS,
  resolveSignupAccountTypes,
  type SignupAccountSelection,
} from "@/data/signupAccountTypes";
import { SIGNUP_ANNUAL_INCOME_OPTIONS } from "@/data/signupAnnualIncome";
import { US_STATE_OPTIONS } from "@/data/usStates";
import { postJson } from "@/lib/clientApi";
import { MEMBER_VERIFY_EMAIL_PATH } from "@/lib/authRoutes";
import { formatUsPhoneInput, getUsPhoneValidationError } from "@/lib/phoneNumber";
import type { RegisterResponse } from "@/types/banking";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState<SignupAccountSelection>(
    DEFAULT_SIGNUP_ACCOUNT_SELECTION,
  );
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [transactionPin, setTransactionPin] = useState("");
  const [confirmTransactionPin, setConfirmTransactionPin] = useState("");
  const [annualIncomeRange, setAnnualIncomeRange] = useState("");
  const [mathAnswer, setMathAnswer] = useState("");
  const [mathToken, setMathToken] = useState("");
  const [mathChallengeKey, setMathChallengeKey] = useState(0);

  function handlePhoneChange(value: string) {
    setPhone(formatUsPhoneInput(value));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const phoneError = getUsPhoneValidationError(phone);

    if (phoneError) {
      setError(phoneError);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const passwordValue = password;
    const confirmPasswordValue = confirmPassword;

    if (passwordValue !== confirmPasswordValue) {
      setError("Passwords must match.");
      return;
    }

    if (transactionPin !== confirmTransactionPin) {
      setError("Transaction PINs must match.");
      return;
    }

    if (transactionPin.length !== 6) {
      setError("Choose a 6-digit transaction PIN.");
      return;
    }

    setIsSubmitting(true);

    const result = await postJson<RegisterResponse>("/api/auth/register", {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      username: String(formData.get("username") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone,
      dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
      occupation: String(formData.get("occupation") ?? ""),
      annualIncomeRange,
      addressLine1: String(formData.get("addressLine1") ?? ""),
      addressLine2: String(formData.get("addressLine2") ?? "") || undefined,
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      postalCode: String(formData.get("postalCode") ?? ""),
      password: passwordValue,
      transactionPin,
      confirmTransactionPin,
      accountTypes: resolveSignupAccountTypes(selectedAccountType),
      mathToken,
      mathAnswer,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      if (result.error.toLowerCase().includes("answer")) {
        setMathChallengeKey((current) => current + 1);
      }
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
                inputMode="numeric"
                required
                value={phone}
                onChange={(event) => handlePhoneChange(event.target.value)}
                maxLength={14}
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

          <AuthField label="Annual income (USD)" htmlFor="register-annual-income" icon={DollarSign}>
            <select
              id="register-annual-income"
              name="annualIncomeRange"
              required
              value={annualIncomeRange}
              onChange={(event) => setAnnualIncomeRange(event.target.value)}
              className={authInputClassName}
            >
              <option value="" disabled>
                Select
              </option>
              {SIGNUP_ANNUAL_INCOME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </AuthField>

          <AuthField label="Choose account" htmlFor="register-account-type" icon={WalletCards}>
            <select
              id="register-account-type"
              name="accountType"
              required
              value={selectedAccountType}
              onChange={(event) =>
                setSelectedAccountType(event.target.value as SignupAccountSelection)
              }
              className={authInputClassName}
            >
              {SIGNUP_ACCOUNT_SELECTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </AuthField>

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
              <PasswordInput
                id="register-password"
                name="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </AuthField>
            <AuthField label="Confirm password" htmlFor="register-confirm-password" icon={LockKeyhole}>
              <PasswordInput
                id="register-confirm-password"
                name="confirmPassword"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </AuthField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField label="Transaction PIN" htmlFor="register-transaction-pin" icon={LockKeyhole}>
              <PasswordInput
                id="register-transaction-pin"
                name="transactionPin"
                autoComplete="off"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
                value={transactionPin}
                onChange={(event) =>
                  setTransactionPin(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
              />
            </AuthField>
            <AuthField
              label="Confirm transaction PIN"
              htmlFor="register-confirm-transaction-pin"
              icon={LockKeyhole}
            >
              <PasswordInput
                id="register-confirm-transaction-pin"
                name="confirmTransactionPin"
                autoComplete="off"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
                value={confirmTransactionPin}
                onChange={(event) =>
                  setConfirmTransactionPin(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
              />
            </AuthField>
          </div>

          <MathChallengeField
            key={mathChallengeKey}
            value={mathAnswer}
            onChange={setMathAnswer}
            onTokenChange={setMathToken}
          />
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
