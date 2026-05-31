"use client";

import { FormEvent, useState } from "react";
import {
  AdminFilterBar,
  AdminFilterField,
  adminInputClassName,
} from "@/components/admin/AdminFilterBar";
import { buttonVariants } from "@/components/ui/Button";
import {
  DEFAULT_SIGNUP_ACCOUNT_TYPES,
  SIGNUP_ACCOUNT_TYPE_OPTIONS,
  type SignupAccountType,
} from "@/data/signupAccountTypes";
import { US_STATE_OPTIONS } from "@/data/usStates";
import { cn } from "@/lib/utils";
import type { AdminCreateMemberInput } from "@/lib/validators";
import type { KycStatus, UserStatus } from "@/types/banking";

type AdminCreateUserFormProps = {
  isSubmitting: boolean;
  error: string | null;
  success: string | null;
  onSubmit: (input: AdminCreateMemberInput) => Promise<boolean>;
  onCancel: () => void;
};

const statusOptions: Extract<UserStatus, "PENDING" | "ACTIVE">[] = ["PENDING", "ACTIVE"];
const kycOptions: KycStatus[] = [
  "NOT_STARTED",
  "SUBMITTED",
  "UNDER_REVIEW",
  "VERIFIED",
  "REJECTED",
];

export function AdminCreateUserForm({
  isSubmitting,
  error,
  success,
  onSubmit,
  onCancel,
}: AdminCreateUserFormProps) {
  const [selectedAccountTypes, setSelectedAccountTypes] = useState<SignupAccountType[]>(
    DEFAULT_SIGNUP_ACCOUNT_TYPES,
  );
  const [formError, setFormError] = useState<string | null>(null);

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
    setFormError(null);

    if (!selectedAccountTypes.includes("SAVINGS")) {
      setFormError("A savings account is required for membership.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setFormError("Passwords must match.");
      return;
    }

    const payload: AdminCreateMemberInput = {
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
      state: String(formData.get("state") ?? "") as AdminCreateMemberInput["state"],
      postalCode: String(formData.get("postalCode") ?? ""),
      password,
      accountTypes: selectedAccountTypes,
      status: String(formData.get("status") ?? "PENDING") as "PENDING" | "ACTIVE",
      kycStatus: String(formData.get("kycStatus") ?? "NOT_STARTED") as KycStatus,
      markEmailVerified: formData.get("markEmailVerified") === "on",
      statusNote: String(formData.get("statusNote") ?? "") || undefined,
    };

    const created = await onSubmit(payload);

    if (created) {
      event.currentTarget.reset();
      setSelectedAccountTypes(DEFAULT_SIGNUP_ACCOUNT_TYPES);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminFilterField label="First name">
          <input name="firstName" required className={adminInputClassName} />
        </AdminFilterField>
        <AdminFilterField label="Last name">
          <input name="lastName" required className={adminInputClassName} />
        </AdminFilterField>
        <AdminFilterField label="Username">
          <input
            name="username"
            required
            minLength={3}
            maxLength={32}
            pattern="[A-Za-z0-9_]{3,32}"
            className={adminInputClassName}
          />
        </AdminFilterField>
        <AdminFilterField label="Email">
          <input name="email" type="email" required className={adminInputClassName} />
        </AdminFilterField>
        <AdminFilterField label="Phone">
          <input name="phone" type="tel" required className={adminInputClassName} />
        </AdminFilterField>
        <AdminFilterField label="Date of birth">
          <input name="dateOfBirth" type="date" required className={adminInputClassName} />
        </AdminFilterField>
        <AdminFilterField label="Occupation">
          <input name="occupation" required className={adminInputClassName} />
        </AdminFilterField>
        <AdminFilterField label="Membership status">
          <select name="status" defaultValue="PENDING" className={adminInputClassName}>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </AdminFilterField>
        <AdminFilterField label="KYC status">
          <select name="kycStatus" defaultValue="NOT_STARTED" className={adminInputClassName}>
            {kycOptions.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </AdminFilterField>
        <AdminFilterField label="Temporary password">
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={adminInputClassName}
          />
        </AdminFilterField>
        <AdminFilterField label="Confirm password">
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={adminInputClassName}
          />
        </AdminFilterField>
      </div>

      <AdminFilterBar className="lg:grid-cols-1">
        <AdminFilterField label="Street address">
          <input name="addressLine1" required className={adminInputClassName} />
        </AdminFilterField>
        <AdminFilterField label="Apt, suite, or unit (optional)">
          <input name="addressLine2" className={adminInputClassName} />
        </AdminFilterField>
        <div className="grid gap-4 sm:grid-cols-3">
          <AdminFilterField label="City">
            <input name="city" required className={adminInputClassName} />
          </AdminFilterField>
          <AdminFilterField label="State">
            <select name="state" required defaultValue="" className={adminInputClassName}>
              <option value="" disabled>
                Select
              </option>
              {US_STATE_OPTIONS.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          </AdminFilterField>
          <AdminFilterField label="ZIP code">
            <input name="postalCode" required className={adminInputClassName} />
          </AdminFilterField>
        </div>
        <AdminFilterField label="Status note (optional)">
          <textarea
            name="statusNote"
            rows={2}
            className={cn(adminInputClassName, "resize-y")}
          />
        </AdminFilterField>
      </AdminFilterBar>

      <div className="rounded-lg border border-primary-navy/[0.08] bg-[#f7fbff] p-4 dark:border-white/[0.08] dark:bg-white/[0.04]">
        <p className="text-sm font-semibold text-primary-navy dark:text-white">Account types</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SIGNUP_ACCOUNT_TYPE_OPTIONS.map((option) => {
            const checked = selectedAccountTypes.includes(option.value);

            return (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-lg border p-3 text-sm transition",
                  checked
                    ? "border-ocean-blue bg-white dark:bg-white/[0.06]"
                    : "border-primary-navy/[0.08] dark:border-white/[0.08]",
                  option.required && "cursor-default",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={option.required}
                  onChange={() => toggleAccountType(option.value, option.required)}
                  className="mt-0.5 h-4 w-4 rounded border-primary-navy/20 text-ocean-blue"
                />
                <span>
                  <span className="font-semibold text-primary-navy dark:text-white">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-bluewave-gray dark:text-white/[0.58]">
                    {option.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-primary-navy/[0.08] px-4 py-3 text-sm dark:border-white/[0.08]">
        <input
          type="checkbox"
          name="markEmailVerified"
          defaultChecked
          className="mt-0.5 h-4 w-4 rounded border-primary-navy/20 text-ocean-blue"
        />
        <span>
          <span className="font-semibold text-primary-navy dark:text-white">
            Mark email as verified
          </span>
          <span className="mt-1 block text-bluewave-gray dark:text-white/[0.58]">
            Leave checked so the member can sign in immediately. Uncheck to send a verification code
            to their email first.
          </span>
        </span>
      </label>

      {formError || error ? (
        <p className="rounded-lg border border-red-500/[0.20] bg-red-500/[0.08] px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
          {formError ?? error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-900 dark:text-emerald-100">
          {success}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className={buttonVariants({
            className: "disabled:cursor-not-allowed disabled:opacity-60",
          })}
        >
          {isSubmitting ? "Creating member..." : "Create member"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-primary-navy/[0.10] px-5 py-2.5 text-sm font-semibold text-primary-navy dark:border-white/[0.10] dark:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
