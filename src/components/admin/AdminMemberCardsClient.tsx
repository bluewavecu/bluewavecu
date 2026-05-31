"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatStatusLabel, StatusBadge, statusToTone } from "@/components/ui/StatusBadge";
import { postJson } from "@/lib/clientApi";
import { adminConsolePath } from "@/lib/adminRoutes";
import type { AdminMemberCardsData, CardType } from "@/types/banking";

const fieldClassName =
  "mt-1.5 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-3 py-2.5 text-sm text-primary-navy outline-none focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white";

type AdminMemberCardsClientProps = {
  userId: string;
};

export function AdminMemberCardsClient({ userId }: AdminMemberCardsClientProps) {
  const [data, setData] = useState<AdminMemberCardsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [accountId, setAccountId] = useState("");
  const [cardType, setCardType] = useState<CardType>("DEBIT");

  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/members/${userId}/cards`, {
        credentials: "include",
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        success: boolean;
        data?: AdminMemberCardsData;
        error?: string;
      };

      if (!payload.success || !payload.data) {
        setError(payload.error ?? "Unable to load member cards.");
        setData(null);
        return;
      }

      setData(payload.data);
      setAccountId((current) => {
        if (current && payload.data!.accounts.some((account) => account.id === current)) {
          return current;
        }

        return payload.data!.accounts[0]?.id ?? "";
      });
    } catch {
      setError("Unable to load member cards.");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchCards();
  }, [fetchCards]);

  async function handleIssueCard(event: React.FormEvent) {
    event.preventDefault();
    setSuccessMessage(null);
    setIsSubmitting(true);

    const result = await postJson<{ message: string }>(`/api/admin/members/${userId}/cards`, {
      accountId,
      cardType,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setError(null);
    setSuccessMessage(result.data.message);
    await fetchCards();
  }

  if (isLoading) {
    return <LoadingState title="Loading member cards" message="Retrieving cards and accounts." />;
  }

  if (error && !data) {
    return <ApiErrorState message={error} onRetry={fetchCards} />;
  }

  if (!data) {
    return (
      <EmptyState title="Member cards unavailable" message="Card records could not be loaded." />
    );
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
              {data.user.fullName}
            </h2>
            <AdminStatusBadge status={data.user.status} />
          </div>
          <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.62]">
            {data.user.email} · @{data.user.username}
          </p>
        </div>
        <Link
          href={adminConsolePath("users")}
          className="text-sm font-semibold text-royal-blue dark:text-light-blue"
        >
          Back to users
        </Link>
      </div>

      <form
        onSubmit={handleIssueCard}
        className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]"
      >
        <h3 className="text-lg font-semibold text-primary-navy dark:text-white">Issue Mastercard</h3>
        <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
          Issue a debit or credit Mastercard linked to one of this member&apos;s active accounts.
        </p>

        {data.accounts.length === 0 ? (
          <p className="mt-4 text-sm text-amber-800 dark:text-amber-200">
            This member has no active accounts available for card issuance.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold">Account</span>
              <select
                required
                value={accountId}
                onChange={(event) => setAccountId(event.target.value)}
                className={fieldClassName}
              >
                {data.accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.displayName} ({account.maskedAccountNumber})
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold">Card type</span>
              <select
                value={cardType}
                onChange={(event) => setCardType(event.target.value as CardType)}
                className={fieldClassName}
              >
                <option value="DEBIT">Debit Mastercard</option>
                <option value="CREDIT">Credit Mastercard</option>
              </select>
            </label>
          </div>
        )}

        {error ? (
          <p className="mt-4 rounded-lg border border-red-500/[0.20] bg-red-500/[0.08] px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        ) : null}

        {successMessage ? (
          <p className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-100">
            {successMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || data.accounts.length === 0}
          className="mt-4 inline-flex h-10 items-center rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy disabled:opacity-70"
        >
          {isSubmitting ? "Issuing..." : "Issue card"}
        </button>
      </form>

      <div className="grid gap-3">
        <h3 className="text-sm font-semibold text-primary-navy dark:text-white">Active cards</h3>
        {data.cards.length > 0 ? (
          data.cards.map((card) => (
            <article
              key={card.id}
              className="rounded-lg border border-primary-navy/[0.08] bg-white p-4 dark:border-white/[0.08] dark:bg-white/[0.04]"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-primary-navy dark:text-white">
                    {card.cardType} Mastercard · {card.maskedPan}
                  </p>
                  <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">
                    {card.linkedAccount.displayName} · Expires {card.expiryLabel ?? "—"}
                  </p>
                </div>
                <StatusBadge
                  label={formatStatusLabel(card.status)}
                  tone={statusToTone(card.status)}
                />
              </div>
            </article>
          ))
        ) : (
          <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">
            No cards issued for this member yet.
          </p>
        )}
      </div>

      {data.applications.length > 0 ? (
        <div className="grid gap-3">
          <h3 className="text-sm font-semibold text-primary-navy dark:text-white">
            Card applications
          </h3>
          {data.applications.map((application) => (
            <article
              key={application.id}
              className="rounded-lg border border-primary-navy/[0.08] bg-[#f7fbff] p-4 dark:border-white/[0.08] dark:bg-white/[0.04]"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-primary-navy dark:text-white">
                    {application.cardType} Mastercard
                  </p>
                  <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">
                    {application.linkedAccount?.displayName} ·{" "}
                    {new Date(application.createdAt).toLocaleString()}
                  </p>
                </div>
                <StatusBadge
                  label={formatStatusLabel(application.status)}
                  tone={statusToTone(application.status)}
                />
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
