"use client";

import { ArrowRight, AtSign, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { FORGOT_PASSWORD_PATH, MEMBER_VERIFY_EMAIL_PATH } from "@/lib/authRoutes";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthField, authInputClassName } from "@/components/auth/AuthField";
import { buttonVariants } from "@/components/ui/Button";
import { getSafeRedirectPath } from "@/lib/authSession";
import { postJson } from "@/lib/clientApi";
import type { AuthResponse } from "@/types/banking";

type LoginFormProps = {
  portal?: "member" | "admin";
};

export function LoginForm({ portal = "member" }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [loginChallengeId, setLoginChallengeId] = useState<string | null>(null);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const sessionExpired = searchParams.get("expired") === "1";
  const passwordReset = searchParams.get("reset") === "1";
  const emailVerified = searchParams.get("verified") === "1";
  const verifiedUsername = searchParams.get("username") ?? "";
  const nextPath = searchParams.get("next");
  const isAdminPortal = portal === "admin";

  async function handleCredentialsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const payload = isAdminPortal
      ? {
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
          portal: "admin" as const,
        }
      : {
          username: String(formData.get("username") ?? ""),
          password: String(formData.get("password") ?? ""),
          portal: "member" as const,
        };

    const result = await postJson<AuthResponse>("/api/auth/login", payload);

    setIsSubmitting(false);

    if (!result.success) {
      if (result.error.toLowerCase().includes("verify your email") && !isAdminPortal) {
        setError(`${result.error} Go to email verification to request a new code.`);
      } else {
        setError(result.error);
      }
      return;
    }

    if ("requiresOtp" in result.data && result.data.requiresOtp) {
      setOtpStep(true);
      setLoginChallengeId(result.data.loginChallengeId);
      setOtpMessage(result.data.message);
      return;
    }

    if ("user" in result.data) {
      const destination = getSafeRedirectPath(nextPath, result.data.user.role);
      router.push(destination);
      router.refresh();
    }
  }

  async function handleOtpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!loginChallengeId) {
      setError("Sign-in verification expired. Start again with your username and password.");
      setIsSubmitting(false);
      return;
    }

    const result = await postJson<AuthResponse>("/api/auth/login", {
      portal: "member" as const,
      loginChallengeId,
      otpCode,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    if ("user" in result.data) {
      const destination = getSafeRedirectPath(nextPath, result.data.user.role);
      router.push(destination);
      router.refresh();
    }
  }

  if (otpStep && !isAdminPortal) {
    return (
      <form onSubmit={handleOtpSubmit} className="space-y-5">
        <div className="rounded-lg border border-ocean-blue/20 bg-ocean-blue/10 px-4 py-3 text-sm text-primary-navy dark:text-white">
          <p className="inline-flex items-start gap-2 font-medium">
            <ShieldCheck size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{otpMessage ?? "Enter the verification code sent to your email."}</span>
          </p>
        </div>

        <AuthField label="Verification code" htmlFor="login-otp" icon={ShieldCheck}>
          <input
            id="login-otp"
            type="text"
            name="otpCode"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            value={otpCode}
            onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            className={authInputClassName}
          />
        </AuthField>

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
          disabled={isSubmitting || otpCode.length !== 6}
          className={buttonVariants({
            className: "w-full disabled:cursor-not-allowed disabled:opacity-60",
          })}
        >
          {isSubmitting ? "Verifying..." : "Verify and sign in"}
          <ArrowRight size={18} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => {
            setOtpStep(false);
            setLoginChallengeId(null);
            setOtpMessage(null);
            setOtpCode("");
            setError(null);
          }}
          className="w-full text-sm font-semibold text-royal-blue hover:text-ocean-blue dark:text-light-blue"
        >
          Back to sign in
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleCredentialsSubmit} className="space-y-5">
      {sessionExpired ? (
        <p
          role="status"
          className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-900 dark:text-amber-100"
        >
          Your session expired due to inactivity. Sign in again to continue.
        </p>
      ) : null}

      {passwordReset ? (
        <p
          role="status"
          className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-900 dark:text-emerald-100"
        >
          Your password was updated. Sign in with your new password.
        </p>
      ) : null}

      {emailVerified ? (
        <p
          role="status"
          className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-900 dark:text-emerald-100"
        >
          Email verified{verifiedUsername ? ` for ${verifiedUsername}` : ""}. Sign in with your
          username and password.
        </p>
      ) : null}

      {isAdminPortal ? (
        <AuthField label="Operations email" htmlFor="login-email" icon={Mail}>
          <input
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            required
            className={authInputClassName}
          />
        </AuthField>
      ) : (
        <AuthField label="Username" htmlFor="login-username" icon={AtSign}>
          <input
            id="login-username"
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
      )}

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

      {!isAdminPortal ? (
        <div className="text-right text-sm">
          <Link
            href={FORGOT_PASSWORD_PATH}
            className="font-semibold text-royal-blue hover:text-ocean-blue dark:text-light-blue"
          >
            Forgot password?
          </Link>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-100"
        >
          <p>{error}</p>
          {error.toLowerCase().includes("verify your email") ? (
            <Link
              href={MEMBER_VERIFY_EMAIL_PATH}
              className="mt-2 inline-flex font-semibold text-royal-blue hover:text-ocean-blue dark:text-light-blue"
            >
              Verify email
            </Link>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className={buttonVariants({
          className: "w-full disabled:cursor-not-allowed disabled:opacity-60",
        })}
      >
        {isSubmitting ? "Signing in..." : isAdminPortal ? "Sign in to console" : "Sign in"}
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </form>
  );
}
