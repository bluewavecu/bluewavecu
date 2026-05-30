"use client";

import { Laptop, LogOut, ShieldCheck, Smartphone } from "lucide-react";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useMfaSettings, useUserSessions } from "@/hooks/useScheduledTransfers";
import { cn } from "@/lib/utils";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function SessionIcon({ deviceName }: { deviceName: string }) {
  const name = deviceName.toLowerCase();

  if (name.includes("iphone") || name.includes("android") || name.includes("ipad")) {
    return <Smartphone size={18} aria-hidden="true" />;
  }

  return <Laptop size={18} aria-hidden="true" />;
}

export function SessionsClient() {
  const { sessions, error, isLoading, isRevoking, revokeSession } = useUserSessions();
  const {
    settings,
    error: mfaError,
    isLoading: mfaLoading,
    isUpdating,
    toggleEmailMfa,
  } = useMfaSettings();

  const emailMfa = settings.find((setting) => setting.method === "EMAIL");
  const emailMfaEnabled = emailMfa?.isEnabled ?? false;

  if (isLoading || mfaLoading) {
    return (
      <LoadingState
        title="Loading security settings"
        message="Retrieving sessions and MFA preferences."
      />
    );
  }

  return (
    <section className="grid gap-5">
      <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue dark:text-light-blue">
            <ShieldCheck size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
              Multi-factor authentication
            </h2>
            <p className="mt-1 text-sm leading-6 text-bluewave-gray dark:text-white/[0.58]">
              Email verification MFA foundation is prepared. OTP delivery will be activated in a
              later step.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 rounded-lg border border-primary-navy/[0.08] bg-[#f7fbff] p-4 dark:border-white/[0.08] dark:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-primary-navy dark:text-white">Email MFA placeholder</p>
            <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
              {emailMfaEnabled ? "Enabled for your account." : "Currently disabled."}
            </p>
          </div>
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => void toggleEmailMfa(!emailMfaEnabled)}
            className={cn(
              "inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70",
              emailMfaEnabled
                ? "border border-primary-navy/[0.12] bg-white text-primary-navy dark:border-white/[0.12] dark:bg-white/[0.06] dark:text-white"
                : "bg-ocean-blue text-primary-navy hover:bg-light-blue",
            )}
          >
            {isUpdating ? "Saving..." : emailMfaEnabled ? "Disable email MFA" : "Enable email MFA"}
          </button>
        </div>

        {mfaError ? (
          <p className="mt-4 text-sm text-red-700 dark:text-red-300">{mfaError}</p>
        ) : null}
      </article>

      <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
        <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Active sessions</h2>
        <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
          Review devices signed in to your Bluewave account. Revoke any session you do not recognize.
        </p>

        {error ? (
          <div className="mt-4">
            <ApiErrorState message={error} />
          </div>
        ) : sessions.length > 0 ? (
          <div className="mt-5 divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue dark:text-light-blue">
                    <SessionIcon deviceName={session.deviceName} />
                  </span>
                  <div>
                    <p className="font-semibold text-primary-navy dark:text-white">
                      {session.deviceName}
                      {session.isCurrent ? (
                        <span className="ml-2 rounded-full bg-ocean-blue/[0.12] px-2 py-0.5 text-xs font-semibold text-royal-blue dark:text-light-blue">
                          Current
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                      {session.ipAddress} | Last seen {formatDate(session.lastSeenAt)}
                    </p>
                    <p className="mt-1 text-xs text-bluewave-gray dark:text-white/[0.48]">
                      {session.isActive ? "Active" : "Revoked"}
                    </p>
                  </div>
                </div>

                {session.isActive ? (
                  <button
                    type="button"
                    disabled={isRevoking}
                    onClick={() => void revokeSession(session.id)}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-primary-navy/[0.10] px-4 text-sm font-semibold text-primary-navy transition hover:border-red-500/[0.30] hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/[0.10] dark:text-white dark:hover:text-red-300"
                  >
                    <LogOut size={15} aria-hidden="true" />
                    Revoke
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-bluewave-gray dark:text-white/[0.58]">
            No sessions found yet. Sign in again to create a tracked session record.
          </p>
        )}
      </article>

      <article className="rounded-lg border border-primary-navy/[0.08] bg-primary-navy p-5 text-white shadow-[0_18px_60px_rgba(10,42,94,0.12)]">
        <h2 className="text-lg font-semibold">Security tips</h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-white/[0.68]">
          <li>Revoke unfamiliar sessions immediately and change your password.</li>
          <li>Enable email MFA when OTP delivery becomes available.</li>
          <li>Review security notifications after transfers and sign-ins.</li>
          <li>Never share verification codes or account credentials.</li>
        </ul>
      </article>
    </section>
  );
}
