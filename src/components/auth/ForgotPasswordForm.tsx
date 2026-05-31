"use client";

import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthField, authInputClassName } from "@/components/auth/AuthField";
import { buttonVariants } from "@/components/ui/Button";
import { MEMBER_AUTH_PATH } from "@/lib/authRoutes";
import { postJson } from "@/lib/clientApi";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const result = await postJson<{ message: string }>("/api/auth/forgot-password", { email });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSuccessMessage(
      result.data?.message ??
        "If an account exists for that email, we sent password reset instructions.",
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AuthField label="Email" htmlFor="forgot-email" icon={Mail}>
        <input
          id="forgot-email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={authInputClassName}
        />
      </AuthField>

      <p className="text-sm leading-6 text-bluewave-gray dark:text-white/[0.62]">
        We&apos;ll email you a secure link and a six-digit verification code so you can choose a
        new password.
      </p>

      {successMessage ? (
        <p
          role="status"
          className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-900 dark:text-emerald-100"
        >
          {successMessage}
        </p>
      ) : null}

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
        {isSubmitting ? "Sending..." : "Send reset instructions"}
        <ArrowRight size={18} aria-hidden="true" />
      </button>

      <p className="text-center text-sm text-bluewave-gray dark:text-white/[0.62]">
        Remember your password?{" "}
        <Link
          href={MEMBER_AUTH_PATH}
          className="font-semibold text-royal-blue hover:text-ocean-blue dark:text-light-blue"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
