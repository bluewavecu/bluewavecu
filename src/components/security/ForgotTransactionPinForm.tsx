"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthField, authInputClassName } from "@/components/auth/AuthField";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { buttonVariants } from "@/components/ui/Button";
import { postJson } from "@/lib/clientApi";
import { MEMBER_SECURITY_PATH } from "@/lib/memberRoutes";

type ForgotTransactionPinFormProps = {
  initialChallengeId?: string;
  initialMessage?: string;
};

export function ForgotTransactionPinForm({
  initialChallengeId = "",
  initialMessage = "",
}: ForgotTransactionPinFormProps) {
  const [challengeId, setChallengeId] = useState(initialChallengeId);
  const [otpMessage, setOtpMessage] = useState(initialMessage);
  const [otpCode, setOtpCode] = useState("");
  const [transactionPin, setTransactionPin] = useState("");
  const [confirmTransactionPin, setConfirmTransactionPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRequestCode() {
    setError(null);
    setSuccess(null);
    setIsRequesting(true);

    const result = await postJson<{
      challengeId: string;
      message: string;
    }>("/api/profile/transaction-pin/request-reset", {});

    setIsRequesting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setChallengeId(result.data.challengeId);
    setOtpMessage(result.data.message);
    setSuccess("Verification code sent to your email.");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (transactionPin !== confirmTransactionPin) {
      setError("Transaction PINs must match.");
      return;
    }

    if (!challengeId) {
      setError("Request a verification code first.");
      return;
    }

    setIsSubmitting(true);

    const result = await postJson<{ message: string }>("/api/profile/transaction-pin/reset", {
      challengeId,
      otpCode,
      transactionPin,
      confirmTransactionPin,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSuccess(result.data.message);
    setOtpCode("");
    setTransactionPin("");
    setConfirmTransactionPin("");
  }

  return (
    <div className="space-y-5">
      {otpMessage ? (
        <div className="rounded-lg border border-ocean-blue/20 bg-ocean-blue/10 px-4 py-3 text-sm text-primary-navy dark:text-white">
          <p className="inline-flex items-start gap-2 font-medium">
            <ShieldCheck size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{otpMessage}</span>
          </p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => void handleRequestCode()}
        disabled={isRequesting}
        className="inline-flex h-11 w-full items-center justify-center rounded-full border border-primary-navy/[0.12] px-5 text-sm font-semibold text-primary-navy transition hover:border-ocean-blue hover:text-royal-blue disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[0.12] dark:text-white"
      >
        {isRequesting ? "Sending code..." : challengeId ? "Resend verification code" : "Email verification code"}
      </button>

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField label="Verification code" htmlFor="pin-reset-otp" icon={ShieldCheck}>
          <input
            id="pin-reset-otp"
            type="text"
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

        <AuthField label="New transaction PIN" htmlFor="pin-reset-pin" icon={ShieldCheck}>
          <PasswordInput
            id="pin-reset-pin"
            name="transactionPin"
            autoComplete="off"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            required
            value={transactionPin}
            onChange={(event) =>
              setTransactionPin(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
          />
        </AuthField>

        <AuthField label="Confirm transaction PIN" htmlFor="pin-reset-confirm" icon={ShieldCheck}>
          <PasswordInput
            id="pin-reset-confirm"
            name="confirmTransactionPin"
            autoComplete="off"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            required
            value={confirmTransactionPin}
            onChange={(event) =>
              setConfirmTransactionPin(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
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
          disabled={
            isSubmitting ||
            !challengeId ||
            otpCode.length !== 6 ||
            transactionPin.length !== 6 ||
            confirmTransactionPin.length !== 6
          }
          className={buttonVariants({
            className: "w-full disabled:cursor-not-allowed disabled:opacity-60",
          })}
        >
          {isSubmitting ? "Updating PIN..." : "Update transaction PIN"}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </form>

      <p className="text-center text-sm text-bluewave-gray dark:text-white/[0.62]">
        <Link
          href={MEMBER_SECURITY_PATH}
          className="font-semibold text-royal-blue hover:text-ocean-blue dark:text-light-blue"
        >
          Back to security
        </Link>
      </p>
    </div>
  );
}
