"use client";

import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AuthField, authInputClassName } from "@/components/auth/AuthField";
import { buttonVariants } from "@/components/ui/Button";
import { MEMBER_LOGIN_PATH } from "@/lib/authRoutes";
import { postJson } from "@/lib/clientApi";
import type { ResendEmailVerificationResponse, VerifyEmailResponse } from "@/types/banking";

type VerifyEmailFormProps = {
  initialUsername?: string;
  initialChallengeId?: string;
  initialMessage?: string;
  initialMaskedEmail?: string;
};

export function VerifyEmailForm({
  initialUsername = "",
  initialChallengeId = "",
  initialMessage = "",
  initialMaskedEmail = "",
}: VerifyEmailFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState(initialUsername);
  const [verificationChallengeId, setVerificationChallengeId] = useState(initialChallengeId);
  const [otpMessage, setOtpMessage] = useState(initialMessage);
  const [maskedEmail, setMaskedEmail] = useState(initialMaskedEmail);
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (initialUsername) {
      return;
    }

    const queryUsername = searchParams.get("username") ?? "";
    const queryChallengeId = searchParams.get("challenge") ?? "";
    const queryMessage = searchParams.get("message") ?? "";
    const queryMaskedEmail = searchParams.get("email") ?? "";

    if (queryUsername) {
      queueMicrotask(() => setUsername(queryUsername));
    }

    if (queryChallengeId) {
      queueMicrotask(() => setVerificationChallengeId(queryChallengeId));
    }

    if (queryMessage) {
      queueMicrotask(() => setOtpMessage(queryMessage));
    }

    if (queryMaskedEmail) {
      queueMicrotask(() => setMaskedEmail(queryMaskedEmail));
    }
  }, [initialUsername, searchParams]);

  async function handleVerifySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!verificationChallengeId) {
      setError("Verification session expired. Request a new code.");
      return;
    }

    setIsSubmitting(true);

    const result = await postJson<VerifyEmailResponse>("/api/auth/verify-email", {
      verificationChallengeId,
      otpCode,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSuccess(result.data.message);
    router.push(`${MEMBER_LOGIN_PATH}?verified=1&username=${encodeURIComponent(result.data.username)}`);
    router.refresh();
  }

  async function handleResendCode() {
    setError(null);
    setSuccess(null);

    if (!username.trim()) {
      setError("Enter your username to request a new code.");
      return;
    }

    setIsResending(true);

    const result = await postJson<ResendEmailVerificationResponse>(
      "/api/auth/verify-email/resend",
      { username: username.trim() },
    );

    setIsResending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setVerificationChallengeId(result.data.verificationChallengeId);
    setUsername(result.data.username);
    setMaskedEmail(result.data.maskedEmail);
    setOtpMessage(result.data.message);
    setOtpCode("");
    setSuccess("A new verification code was sent.");
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-ocean-blue/20 bg-ocean-blue/10 px-4 py-3 text-sm text-primary-navy dark:text-white">
        <p className="inline-flex items-start gap-2 font-medium">
          <ShieldCheck size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            {otpMessage ||
              (maskedEmail
                ? `Enter the 6-digit code sent to ${maskedEmail}.`
                : "Enter the 6-digit code sent to your email.")}
          </span>
        </p>
      </div>

      <AuthField label="Username" htmlFor="verify-email-username" icon={Mail}>
        <input
          id="verify-email-username"
          type="text"
          name="username"
          autoComplete="username"
          required
          minLength={3}
          maxLength={32}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className={authInputClassName}
        />
      </AuthField>

      <form onSubmit={handleVerifySubmit} className="space-y-5">
        <AuthField label="Verification code" htmlFor="verify-email-otp" icon={ShieldCheck}>
          <input
            id="verify-email-otp"
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

        {success ? (
          <p
            role="status"
            className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-900 dark:text-emerald-100"
          >
            {success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || otpCode.length !== 6 || !verificationChallengeId}
          className={buttonVariants({
            className: "w-full disabled:cursor-not-allowed disabled:opacity-60",
          })}
        >
          {isSubmitting ? "Verifying..." : "Verify email"}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </form>

      <button
        type="button"
        onClick={handleResendCode}
        disabled={isResending || !username.trim()}
        className="w-full text-sm font-semibold text-royal-blue hover:text-ocean-blue disabled:cursor-not-allowed disabled:opacity-60 dark:text-light-blue"
      >
        {isResending ? "Sending new code..." : "Resend verification code"}
      </button>
    </div>
  );
}
