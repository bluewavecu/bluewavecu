"use client";

import { ArrowRight, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { buttonVariants } from "@/components/ui/Button";

const fields = [
  {
    label: "Full name",
    name: "name",
    type: "text",
    autoComplete: "name",
    placeholder: "Avery Morgan",
    icon: UserRound,
  },
  {
    label: "Email",
    name: "email",
    type: "email",
    autoComplete: "email",
    placeholder: "member@bluewavecu.com",
    icon: Mail,
  },
  {
    label: "Phone",
    name: "phone",
    type: "tel",
    autoComplete: "tel",
    placeholder: "(555) 014-2084",
    icon: Phone,
  },
  {
    label: "Password",
    name: "password",
    type: "password",
    autoComplete: "new-password",
    placeholder: "Create password",
    icon: LockKeyhole,
  },
  {
    label: "Confirm password",
    name: "confirmPassword",
    type: "password",
    autoComplete: "new-password",
    placeholder: "Confirm password",
    icon: LockKeyhole,
  },
];

export function RegisterForm() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => {
        const Icon = field.icon;

        return (
          <label key={field.name} className="block">
            <span className="text-sm font-semibold text-primary-navy dark:text-white">
              {field.label}
            </span>
            <span className="mt-2 flex items-center gap-3 rounded-lg border border-primary-navy/[0.10] bg-white px-4 py-3 text-bluewave-gray shadow-[0_12px_34px_rgba(10,42,94,0.06)] focus-within:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06]">
              <Icon size={18} aria-hidden="true" />
              <input
                type={field.type}
                name={field.name}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                className="w-full bg-transparent text-primary-navy outline-none placeholder:text-bluewave-gray dark:text-white"
              />
            </span>
          </label>
        );
      })}

      <button type="submit" className={buttonVariants({ className: "w-full" })}>
        Create Account
        <ArrowRight size={18} aria-hidden="true" />
      </button>

      <p className="text-center text-sm text-bluewave-gray dark:text-white/[0.62]">
        Already have access?{" "}
        <Link href="/login" className="font-semibold text-royal-blue hover:text-ocean-blue">
          Sign in
        </Link>
      </p>
    </form>
  );
}
