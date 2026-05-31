"use client";

import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthField, authInputClassName } from "@/components/auth/AuthField";
import { buttonVariants } from "@/components/ui/Button";
import { getSafeRedirectPath } from "@/lib/authSession";
import { postJson } from "@/lib/clientApi";
import type { AuthResponse } from "@/types/banking";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sessionExpired = searchParams.get("expired") === "1";
  const nextPath = searchParams.get("next");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await postJson<AuthResponse>("/api/auth/login", {
      email,
      password,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    const destination = getSafeRedirectPath(nextPath, result.data.user.role);
    router.push(destination);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {sessionExpired ? (
        <p
          role="status"
          className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-900 dark:text-amber-100"
        >
          Your session expired. Sign in again to continue.
        </p>
      ) : null}

      <AuthField label="Email" htmlFor="login-email" icon={Mail}>
        <input
          id="login-email"
          type="email"
          name="email"
          autoComplete="email"
          required
          className={authInputClassName}
        />
      </AuthField>

      <AuthField label="Password" htmlFor="login-password" icon={LockKeyhole}>
        <input
          id="login-password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className={authInputClassName}
        />
      </AuthField>

      <div className="text-right text-sm">
        <Link href="/support" className="font-semibold text-royal-blue hover:text-ocean-blue dark:text-light-blue">
          Forgot password?
        </Link>
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
        {isSubmitting ? "Signing in..." : "Sign in"}
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </form>
  );
}
