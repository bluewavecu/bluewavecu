"use client";

import { ArrowRight, KeyRound, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { AuthField, authInputClassName } from "@/components/auth/AuthField";
import { buttonVariants } from "@/components/ui/Button";
import { FORGOT_PASSWORD_PATH, MEMBER_AUTH_PATH } from "@/lib/authRoutes";
import { postJson } from "@/lib/clientApi";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token")?.trim() ?? "";

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const usingResetLink = useMemo(() => Boolean(tokenFromUrl), [tokenFromUrl]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = usingResetLink
      ? {
          token: tokenFromUrl,
          newPassword,
          confirmPassword,
        }
      : {
          email,
          code,
          newPassword,
          confirmPassword,
        };

    const result = await postJson<{ message: string }>("/api/auth/reset-password", payload);

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push(`${MEMBER_AUTH_PATH}?reset=1`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {usingResetLink ? (
        <p className="rounded-lg border border-ocean-blue/20 bg-ocean-blue/10 px-4 py-3 text-sm leading-6 text-primary-navy dark:text-white">
          You opened a secure reset link from your email. Choose a new password below.
        </p>
      ) : (
        <>
          <AuthField label="Email" htmlFor="reset-email" icon={Mail}>
            <input
              id="reset-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={authInputClassName}
            />
          </AuthField>

          <AuthField label="Verification code" htmlFor="reset-code" icon={KeyRound}>
            <input
              id="reset-code"
              type="text"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              className={authInputClassName}
              placeholder="6-digit code"
            />
          </AuthField>
        </>
      )}

      <AuthField label="New password" htmlFor="reset-new-password" icon={LockKeyhole}>
        <input
          id="reset-new-password"
          type="password"
          name="newPassword"
          autoComplete="new-password"
          required
          minLength={8}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          className={authInputClassName}
        />
      </AuthField>

      <AuthField label="Confirm new password" htmlFor="reset-confirm-password" icon={LockKeyhole}>
        <input
          id="reset-confirm-password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
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
        disabled={isSubmitting}
        className={buttonVariants({
          className: "w-full disabled:cursor-not-allowed disabled:opacity-60",
        })}
      >
        {isSubmitting ? "Updating..." : "Update password"}
        <ArrowRight size={18} aria-hidden="true" />
      </button>

      <div className="space-y-2 text-center text-sm text-bluewave-gray dark:text-white/[0.62]">
        {!usingResetLink ? (
          <p>
            Prefer the reset link? Open the email we sent and tap{" "}
            <span className="font-semibold text-primary-navy dark:text-white">
              Choose a new password
            </span>
            .
          </p>
        ) : (
          <p>
            Need a new code?{" "}
            <Link
              href={FORGOT_PASSWORD_PATH}
              className="font-semibold text-royal-blue hover:text-ocean-blue dark:text-light-blue"
            >
              Request reset instructions again
            </Link>
            .
          </p>
        )}

        <p>
          <Link
            href={MEMBER_AUTH_PATH}
            className="font-semibold text-royal-blue hover:text-ocean-blue dark:text-light-blue"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </form>
  );
}
