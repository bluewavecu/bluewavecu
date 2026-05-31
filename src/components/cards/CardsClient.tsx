"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Globe,
  KeyRound,
  LockKeyhole,
  Plane,
  Plus,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { BluewaveMastercard } from "@/components/cards/BluewaveMastercard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { InfoPanel } from "@/components/ui/InfoPanel";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatStatusLabel, StatusBadge, statusToTone } from "@/components/ui/StatusBadge";
import { buttonVariants } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatCurrency";
import { useCards } from "@/hooks/useCards";
import { postJson } from "@/lib/clientApi";
import { cn } from "@/lib/utils";
import type { CardsData, CardTransactionSummary, CardType } from "@/types/banking";

const cardControls = [
  { action: "LOCK" as const, label: "Lock Card", icon: LockKeyhole },
  { action: "REPORT_LOST" as const, label: "Report Lost/Stolen", icon: ShieldAlert },
  { action: "REQUEST_REPLACEMENT" as const, label: "Request Replacement", icon: RefreshCw },
  { action: "TRAVEL_NOTICE" as const, label: "Travel Notice", icon: Plane },
  { action: "UPDATE_SPENDING_LIMIT" as const, label: "Spending Limits", icon: KeyRound },
];

function CardTransactionsPanel({ cardId }: { cardId: string }) {
  const [transactions, setTransactions] = useState<CardTransactionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    void fetch(`/api/cards/${cardId}/transactions`, {
      cache: "no-store",
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = (await response.json()) as {
          success: boolean;
          data?: { transactions: CardTransactionSummary[] };
          error?: string;
        };

        if (!payload.success || !payload.data) {
          setError(payload.error ?? "Unable to load card activity.");
          return;
        }

        setTransactions(payload.data.transactions);
      })
      .catch((fetchError) => {
        if (!controller.signal.aborted) {
          setError(fetchError instanceof Error ? fetchError.message : "Unable to load card activity.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [cardId]);

  if (isLoading) {
    return <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">Loading card activity...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-700 dark:text-red-300">{error}</p>;
  }

  if (transactions.length === 0) {
    return (
      <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">
        No card purchases yet. Activity will appear here when you use this Mastercard.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-start justify-between gap-4 rounded-lg border border-primary-navy/[0.08] bg-[#f7fbff] p-4 dark:border-white/[0.08] dark:bg-white/[0.05]"
        >
          <div>
            <p className="font-semibold text-primary-navy dark:text-white">
              {transaction.merchant ?? transaction.description}
            </p>
            <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
              {transaction.description}
            </p>
            <p className="mt-1 text-xs text-bluewave-gray dark:text-white/[0.45]">
              {new Date(transaction.createdAt).toLocaleString()} · {transaction.reference}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-primary-navy dark:text-white">
              {formatCurrency(transaction.amount)}
            </p>
            <StatusBadge
              label={formatStatusLabel(transaction.status)}
              tone={statusToTone(transaction.status)}
              className="mt-2"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ApplyCardPanel({
  accounts,
  hasPending,
  onApplied,
}: {
  accounts: CardsData["accounts"];
  hasPending: boolean;
  onApplied: () => Promise<void>;
}) {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [cardType, setCardType] = useState<CardType>("DEBIT");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const result = await postJson<{ message: string }>("/api/cards", {
      accountId,
      cardType,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Unable to submit card application.");
      return;
    }

    setSuccess(result.data?.message ?? "Application submitted.");
    await onApplied();
  }

  if (accounts.length === 0) {
    return (
      <InfoPanel title="Apply for a Mastercard">
        You need an active Bluewave account before applying for a card.{" "}
        <Link href="/auth/accounts" className="font-semibold text-royal-blue">
          View your accounts
        </Link>
        .
      </InfoPanel>
    );
  }

  return (
    <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
            Apply for a Mastercard
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-bluewave-gray dark:text-white/[0.58]">
            Request a Bluewave debit or credit Mastercard linked to your membership profile and
            mailing address. Approved cards are issued on the 552901 Mastercard range.
          </p>
        </div>
        <BluewaveMastercard
          cardholderName="Your Name"
          maskedPan="5529 01•• •••• ••••"
          expiryLabel="••/••"
          cardType={cardType}
          className="w-full max-w-[320px]"
        />
      </div>

      {hasPending ? (
        <p className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
          You already have a card application under review. We will notify you when it is approved.
        </p>
      ) : (
        <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-primary-navy dark:text-white">Linked account</span>
            <select
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.displayName} · {account.maskedAccountNumber}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-primary-navy dark:text-white">Card type</span>
            <select
              value={cardType}
              onChange={(event) => setCardType(event.target.value as CardType)}
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            >
              <option value="DEBIT">Debit Mastercard</option>
              <option value="CREDIT">Credit Mastercard</option>
            </select>
          </label>

          <div className="md:col-span-2">
            <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">
              Your legal name and mailing address from your profile will be attached to this
              application.{" "}
              <Link href="/auth/profile" className="font-semibold text-royal-blue dark:text-light-blue">
                Review profile
              </Link>
              .
            </p>
          </div>

          {error ? <p className="md:col-span-2 text-sm text-red-700 dark:text-red-300">{error}</p> : null}
          {success ? (
            <p className="md:col-span-2 text-sm text-emerald-700 dark:text-emerald-300">{success}</p>
          ) : null}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={buttonVariants({
                className: "inline-flex disabled:cursor-not-allowed disabled:opacity-60",
              })}
            >
              <Plus size={18} aria-hidden="true" />
              {isSubmitting ? "Submitting..." : "Apply for card"}
            </button>
          </div>
        </form>
      )}
    </article>
  );
}

export function CardsClient() {
  const { data, error, isLoading, refetch } = useCards();
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [pendingCardId, setPendingCardId] = useState<string | null>(null);

  const hasPendingApplication = useMemo(
    () => data?.applications.some((application) => application.status === "PENDING") ?? false,
    [data?.applications],
  );

  if (isLoading) {
    return <LoadingState title="Loading cards" message="Retrieving your card information." />;
  }

  if (error) {
    return <ApiErrorState message={error} onRetry={refetch} />;
  }

  if (!data) {
    return null;
  }

  async function handleCardAction(cardId: string, action: (typeof cardControls)[number]["action"]) {
    setPendingCardId(cardId);
    setActionMessage(null);

    const result = await postJson<{ message: string }>("/api/cards/actions", {
      cardId,
      action,
    });

    setPendingCardId(null);

    if (!result.success) {
      setActionMessage(result.error ?? "Unable to submit card request.");
      return;
    }

    setActionMessage(result.data?.message ?? "Request submitted.");
  }

  return (
    <section className="grid gap-5">
      <InfoPanel title="Bluewave Mastercard">
        Apply for a debit or credit Mastercard linked to your membership details. Approved cards use
        the 552901 Mastercard range and show purchase activity here in online banking.
      </InfoPanel>

      <ApplyCardPanel
        accounts={data.accounts}
        hasPending={hasPendingApplication}
        onApplied={refetch}
      />

      {data.applications
        .filter((application) => application.status !== "APPROVED")
        .map((application) => (
          <article
            key={application.id}
            className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-primary-navy dark:text-white">
                  {application.cardType} Mastercard application
                </p>
                <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                  {application.linkedAccount?.displayName} · Submitted{" "}
                  {new Date(application.createdAt).toLocaleString()}
                </p>
              </div>
              <StatusBadge
                label={formatStatusLabel(application.status)}
                tone={statusToTone(application.status)}
              />
            </div>
            <div className="mt-4 grid gap-2 text-sm text-bluewave-gray dark:text-white/[0.62] sm:grid-cols-2">
              <p>
                <span className="font-semibold text-primary-navy dark:text-white">Name:</span>{" "}
                {application.cardholderName}
              </p>
              <p>
                <span className="font-semibold text-primary-navy dark:text-white">Email:</span>{" "}
                {application.email}
              </p>
              <p className="sm:col-span-2 whitespace-pre-line">
                <span className="font-semibold text-primary-navy dark:text-white">Address:</span>{" "}
                {application.formattedAddress}
              </p>
              {application.reviewNote ? <p className="sm:col-span-2">Note: {application.reviewNote}</p> : null}
            </div>
          </article>
        ))}

      {data.cards.length === 0 ? (
        <EmptyState
          title="No active cards yet"
          message="Once your Mastercard application is approved, your card will appear here with controls and purchase activity."
        />
      ) : null}

      {actionMessage ? (
        <p className="rounded-lg border border-ocean-blue/[0.20] bg-ocean-blue/[0.08] px-4 py-3 text-sm font-medium text-royal-blue dark:text-light-blue">
          {actionMessage}
        </p>
      ) : null}

      {data.cards.map((card) => (
        <div key={card.id} className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
          <div className="grid gap-5">
            <BluewaveMastercard
              cardholderName={card.cardholderName}
              maskedPan={card.maskedPan}
              expiryLabel={card.expiryLabel}
              cardType={card.cardType}
              status={card.status}
            />

            <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Card details</h2>
                <StatusBadge
                  label={formatStatusLabel(card.status)}
                  tone={statusToTone(card.status)}
                />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-bluewave-gray dark:text-white/[0.45]">
                    Network
                  </p>
                  <p className="mt-2 font-semibold text-primary-navy dark:text-white">
                    {card.network} · 552901
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-bluewave-gray dark:text-white/[0.45]">
                    Linked account
                  </p>
                  <p className="mt-2 font-semibold text-primary-navy dark:text-white">
                    {card.linkedAccount.displayName}
                  </p>
                  <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">
                    {card.linkedAccount.maskedAccountNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-bluewave-gray dark:text-white/[0.45]">
                    Spending limit
                  </p>
                  <p className="mt-2 text-xl font-semibold text-primary-navy dark:text-white">
                    {formatCurrency(card.spendingLimit)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
              <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Card activity</h2>
              <div className="mt-4">
                <CardTransactionsPanel cardId={card.id} />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
            <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Card controls</h2>
            <div className="mt-5 grid gap-3">
              {cardControls.map((control) => {
                const Icon = control.icon;
                const isPending = pendingCardId === card.id;

                return (
                  <button
                    key={`${card.id}-${control.action}`}
                    type="button"
                    disabled={isPending}
                    onClick={() => void handleCardAction(card.id, control.action)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border border-primary-navy/[0.08] bg-[#f7fbff] p-4 text-left transition hover:border-ocean-blue/[0.40] dark:border-white/[0.08] dark:bg-white/[0.05]",
                      isPending && "opacity-70",
                    )}
                  >
                    <span className="flex items-center gap-3 text-sm font-semibold text-primary-navy dark:text-white">
                      <Icon size={18} className="text-royal-blue dark:text-light-blue" aria-hidden="true" />
                      {control.label}
                    </span>
                    <Globe size={14} className="text-bluewave-gray dark:text-white/[0.48]" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
