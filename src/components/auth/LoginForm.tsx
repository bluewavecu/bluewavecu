"use client";

import { ArrowRight, Eye, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { buttonVariants } from "@/components/ui/Button";
import { postJson } from "@/lib/clientApi";
import type { AuthResponse } from "@/types/banking";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block">
        <span className="text-sm font-semibold text-primary-navy dark:text-white">Email</span>
        <span className="mt-2 flex items-center gap-3 rounded-lg border border-primary-navy/[0.10] bg-white px-4 py-3 text-bluewave-gray shadow-[0_12px_34px_rgba(10,42,94,0.06)] focus-within:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06]">
          <Mail size={18} aria-hidden="true" />
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="member@bluewavecu.com"
            required
            className="w-full bg-transparent text-primary-navy outline-none placeholder:text-bluewave-gray dark:text-white"
          />
        </span>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-primary-navy dark:text-white">
          Password
        </span>
        <span className="mt-2 flex items-center gap-3 rounded-lg border border-primary-navy/[0.10] bg-white px-4 py-3 text-bluewave-gray shadow-[0_12px_34px_rgba(10,42,94,0.06)] focus-within:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06]">
          <LockKeyhole size={18} aria-hidden="true" />
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter password"
            required
            className="w-full bg-transparent text-primary-navy outline-none placeholder:text-bluewave-gray dark:text-white"
          />
          <Eye size={18} aria-hidden="true" />
        </span>
      </label>

      <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex items-center gap-2 font-medium text-bluewave-gray dark:text-white/[0.66]">
          <input
            type="checkbox"
            name="remember"
            className="h-4 w-4 rounded border-primary-navy/[0.22] accent-ocean-blue"
          />
          Remember me
        </label>
        <Link href="/support" className="font-semibold text-royal-blue hover:text-ocean-blue">
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
        {isSubmitting ? "Signing In..." : "Sign In"}
        <ArrowRight size={18} aria-hidden="true" />
      </button>

      <p className="text-center text-sm text-bluewave-gray dark:text-white/[0.62]">
        New to Bluewave?{" "}
        <Link href="/register" className="font-semibold text-royal-blue hover:text-ocean-blue">
          Create an account
        </Link>
      </p>
    </form>
  );
}
