"use client";

import { useCallback, useEffect, useState } from "react";
import { patchJson } from "@/lib/clientApi";
import type {
  AdminUserSummaryWithKyc,
  MemberTransferOtpStepRecord,
  MemberTransferOtpStepsData,
  TransferOtpStepKey,
} from "@/types/banking";

const fieldClassName =
  "mt-1.5 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-3 py-2.5 text-sm text-primary-navy outline-none focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white";

export function AdminTransferOtpClient() {
  const [users, setUsers] = useState<AdminUserSummaryWithKyc[]>([]);
  const [userId, setUserId] = useState("");
  const [steps, setSteps] = useState<MemberTransferOtpStepRecord[]>([]);
  const [userName, setUserName] = useState("");
  const [draftCodes, setDraftCodes] = useState<Partial<Record<TransferOtpStepKey, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin/users?role=USER", { credentials: "include", cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { success: boolean; data?: { users: AdminUserSummaryWithKyc[] } }) => {
        if (payload.success && payload.data) {
          setUsers(payload.data.users.filter((user) => user.status === "ACTIVE"));
        }
      });
  }, []);

  const loadSteps = useCallback(async (selectedUserId: string) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const response = await fetch(`/api/admin/transfer-otp-steps?userId=${selectedUserId}`, {
      credentials: "include",
      cache: "no-store",
    });
    const payload = (await response.json()) as {
      success: boolean;
      data?: MemberTransferOtpStepsData;
      error?: string;
    };

    setIsLoading(false);

    if (!payload.success || !payload.data) {
      setSteps([]);
      setUserName("");
      setError(payload.error ?? "Unable to load transfer verification steps.");
      return;
    }

    setSteps(payload.data.steps);
    setUserName(payload.data.userName);
    setDraftCodes(
      Object.fromEntries(
        payload.data.steps
          .filter((step) => step.code)
          .map((step) => [step.stepKey, step.code as string]),
      ),
    );
  }, []);

  useEffect(() => {
    if (!userId) {
      queueMicrotask(() => {
        setSteps([]);
        setUserName("");
        setDraftCodes({});
      });
      return;
    }

    void Promise.resolve().then(() => {
      void loadSteps(userId);
    });
  }, [loadSteps, userId]);

  async function updateStep(step: MemberTransferOtpStepRecord, enabled: boolean, code?: string) {
    if (!userId) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    const result = await patchJson<{ steps: MemberTransferOtpStepRecord[] }>(
      "/api/admin/transfer-otp-steps",
      {
        userId,
        stepKey: step.stepKey,
        enabled,
        code,
      },
    );

    setIsSaving(false);

    if (!result.success) {
      setError("error" in result ? result.error : "Unable to update step.");
      return;
    }

    setSteps(result.data.steps);
    setDraftCodes(
      Object.fromEntries(
        result.data.steps
          .filter((item) => item.code)
          .map((item) => [item.stepKey, item.code as string]),
      ),
    );
    setSuccessMessage(
      enabled
        ? `${step.label} activated${code ? ` with code ${code}` : ""}.`
        : `${step.label} deactivated.`,
    );
  }

  async function updateAll(enabled: boolean) {
    if (!userId) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    const result = await patchJson<{ steps: MemberTransferOtpStepRecord[] }>(
      "/api/admin/transfer-otp-steps",
      enabled ? { userId, enableAll: true } : { userId, disableAll: true },
    );

    setIsSaving(false);

    if (!result.success) {
      setError("error" in result ? result.error : "Unable to update steps.");
      return;
    }

    setSteps(result.data.steps);
    setDraftCodes(
      Object.fromEntries(
        result.data.steps
          .filter((item) => item.code)
          .map((item) => [item.stepKey, item.code as string]),
      ),
    );
    setSuccessMessage(enabled ? "All transfer verification steps activated." : "All steps deactivated.");
  }

  async function saveStepCode(step: MemberTransferOtpStepRecord) {
    const code = draftCodes[step.stepKey]?.replace(/\D/g, "").slice(0, 6);

    if (!code || code.length !== 6) {
      setError(`${step.label} code must be 6 digits.`);
      return;
    }

    await updateStep(step, true, code);
  }

  const activeCount = steps.filter((step) => step.enabled).length;

  return (
    <section className="grid gap-5">
      <div className="max-w-3xl rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]">
        <h2 className="text-lg font-semibold">Member transfer verification</h2>
        <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
          Activate one or more OTP steps for a member. Share each 6-digit code when they submit a transfer.
        </p>

        <label className="mt-4 block max-w-md">
          <span className="text-sm font-semibold">Member</span>
          <select
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            className={fieldClassName}
          >
            <option value="">Select member</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName} ({user.username})
              </option>
            ))}
          </select>
        </label>

        {userId ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => void updateAll(true)}
              className="rounded-full bg-ocean-blue px-4 py-2 text-sm font-semibold text-primary-navy disabled:opacity-70"
            >
              Activate all
            </button>
            <button
              type="button"
              disabled={isSaving || activeCount === 0}
              onClick={() => void updateAll(false)}
              className="rounded-full border px-4 py-2 text-sm font-semibold disabled:opacity-70 dark:border-white/[0.12] dark:text-white"
            >
              Deactivate all
            </button>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {successMessage ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-100">
          {successMessage}
        </p>
      ) : null}

      {userId && isLoading ? (
        <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">Loading steps for {userName}...</p>
      ) : null}

      {userId && !isLoading ? (
        <div className="grid gap-3">
          {steps.map((step) => (
            <article
              key={step.stepKey}
              className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-bluewave-gray dark:text-white/[0.52]">
                    Step {step.order}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-primary-navy dark:text-white">
                    {step.label}
                  </h3>
                  <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                    {step.description}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() =>
                      void updateStep(
                        step,
                        !step.enabled,
                        step.enabled ? undefined : draftCodes[step.stepKey],
                      )
                    }
                    className={
                      step.enabled
                        ? "rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200"
                        : "rounded-full border px-4 py-2 text-sm font-semibold dark:border-white/[0.12] dark:text-white"
                    }
                  >
                    {step.enabled ? "Active" : "Activate"}
                  </button>
                </div>
              </div>

              {step.enabled ? (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                  <label className="block flex-1">
                    <span className="text-sm font-semibold">6-digit OTP</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={draftCodes[step.stepKey] ?? step.code ?? ""}
                      onChange={(event) =>
                        setDraftCodes((current) => ({
                          ...current,
                          [step.stepKey]: event.target.value.replace(/\D/g, "").slice(0, 6),
                        }))
                      }
                      className={fieldClassName}
                    />
                  </label>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => void saveStepCode(step)}
                    className="inline-flex h-10 items-center rounded-full bg-ocean-blue px-4 text-sm font-semibold text-primary-navy disabled:opacity-70"
                  >
                    Save code
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
