"use client";

import { ArrowRight, Eye, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { buttonVariants } from "@/components/ui/Button";

export function LoginForm() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/dashboard");
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

      <button type="submit" className={buttonVariants({ className: "w-full" })}>
        Sign In
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
