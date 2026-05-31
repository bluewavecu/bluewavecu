"use client";

import { useState } from "react";
import { postJson } from "@/lib/clientApi";

type ChangePasswordFormProps = {
  title?: string;
  description?: string;
};

export function ChangePasswordForm({
  title = "Change password",
  description = "Use a unique password with at least 8 characters. You will stay signed in after updating.",
}: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  async function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setIsUpdatingPassword(true);

    const result = await postJson<{ message: string }>("/api/auth/password", {
      currentPassword,
      newPassword,
      confirmPassword,
    });

    setIsUpdatingPassword(false);

    if (!result.success) {
      setPasswordError(result.error ?? "Unable to update password.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSuccess(result.data?.message ?? "Password updated successfully.");
  }

  return (
    <form
      onSubmit={(event) => void handlePasswordSubmit(event)}
      className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
    >
      <h2 className="text-lg font-semibold text-primary-navy dark:text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-bluewave-gray dark:text-white/[0.58]">
        {description}
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-primary-navy dark:text-white">
            Current password
          </span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-primary-navy dark:text-white">
            New password
          </span>
          <input
            type="password"
            required
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-primary-navy dark:text-white">
            Confirm new password
          </span>
          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
          />
        </label>
      </div>

      {passwordError ? (
        <p className="mt-4 text-sm text-red-700 dark:text-red-300">{passwordError}</p>
      ) : null}
      {passwordSuccess ? (
        <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-300">{passwordSuccess}</p>
      ) : null}

      <button
        type="submit"
        disabled={isUpdatingPassword}
        className="mt-5 inline-flex h-11 items-center rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy disabled:opacity-70"
      >
        {isUpdatingPassword ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
