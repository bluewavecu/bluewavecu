"use client";

import {
  ArrowRight,
  Briefcase,
  Calendar,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { buttonVariants } from "@/components/ui/Button";
import { postJson } from "@/lib/clientApi";
import type { AuthResponse } from "@/types/banking";

type FieldConfig = {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  icon: typeof UserRound;
  required?: boolean;
  minLength?: number;
};

const personalFields: FieldConfig[] = [
  {
    label: "Full name",
    name: "fullName",
    type: "text",
    autoComplete: "name",
    icon: UserRound,
  },
  {
    label: "Email",
    name: "email",
    type: "email",
    autoComplete: "email",
    icon: Mail,
  },
  {
    label: "Phone",
    name: "phone",
    type: "tel",
    autoComplete: "tel",
    icon: Phone,
  },
  {
    label: "Date of birth",
    name: "dateOfBirth",
    type: "date",
    autoComplete: "bday",
    icon: Calendar,
  },
  {
    label: "Occupation",
    name: "occupation",
    type: "text",
    autoComplete: "organization-title",
    icon: Briefcase,
  },
];

const addressFields: FieldConfig[] = [
  {
    label: "Street address",
    name: "addressLine1",
    type: "text",
    autoComplete: "address-line1",
    icon: MapPin,
  },
  {
    label: "Apt, suite, or unit",
    name: "addressLine2",
    type: "text",
    autoComplete: "address-line2",
    icon: MapPin,
    required: false,
  },
  {
    label: "City",
    name: "city",
    type: "text",
    autoComplete: "address-level2",
    icon: MapPin,
  },
  {
    label: "State",
    name: "state",
    type: "text",
    autoComplete: "address-level1",
    icon: MapPin,
  },
  {
    label: "Postal code",
    name: "postalCode",
    type: "text",
    autoComplete: "postal-code",
    icon: MapPin,
  },
  {
    label: "Country",
    name: "country",
    type: "text",
    autoComplete: "country-name",
    icon: MapPin,
  },
];

const securityFields: FieldConfig[] = [
  {
    label: "Password",
    name: "password",
    type: "password",
    autoComplete: "new-password",
    icon: LockKeyhole,
    minLength: 8,
  },
  {
    label: "Confirm password",
    name: "confirmPassword",
    type: "password",
    autoComplete: "new-password",
    icon: LockKeyhole,
    minLength: 8,
  },
];

function FormField({ field }: { field: FieldConfig }) {
  const Icon = field.icon;

  return (
    <label className="block">
      <span className="text-sm font-semibold text-primary-navy dark:text-white">{field.label}</span>
      <span className="mt-2 flex items-center gap-3 rounded-lg border border-primary-navy/[0.10] bg-white px-4 py-3 text-bluewave-gray shadow-[0_12px_34px_rgba(10,42,94,0.06)] focus-within:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06]">
        <Icon size={18} aria-hidden="true" />
        <input
          type={field.type}
          name={field.name}
          autoComplete={field.autoComplete}
          required={field.required !== false}
          minLength={field.minLength}
          defaultValue={field.name === "country" ? "US" : undefined}
          className="w-full bg-transparent text-primary-navy outline-none dark:text-white"
        />
      </span>
    </label>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("Passwords must match.");
      return;
    }

    setIsSubmitting(true);

    const result = await postJson<AuthResponse>("/api/auth/register", {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
      occupation: String(formData.get("occupation") ?? ""),
      addressLine1: String(formData.get("addressLine1") ?? ""),
      addressLine2: String(formData.get("addressLine2") ?? "") || undefined,
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      postalCode: String(formData.get("postalCode") ?? ""),
      country: String(formData.get("country") ?? "US"),
      password,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-wide text-ocean-blue">
          Personal information
        </legend>
        {personalFields.map((field) => (
          <FormField key={field.name} field={field} />
        ))}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-wide text-ocean-blue">
          Mailing address
        </legend>
        {addressFields.map((field) => (
          <FormField key={field.name} field={field} />
        ))}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-wide text-ocean-blue">
          Online banking credentials
        </legend>
        {securityFields.map((field) => (
          <FormField key={field.name} field={field} />
        ))}
      </fieldset>

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

      <p className="text-center text-sm text-bluewave-gray dark:text-white/[0.62]">
        Already a member?{" "}
        <Link href="/login" className="font-semibold text-royal-blue hover:text-ocean-blue">
          Sign in
        </Link>
      </p>
    </form>
  );
}
