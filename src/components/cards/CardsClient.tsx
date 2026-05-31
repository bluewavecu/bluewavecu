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
import { LoadingState } from "@/components/ui/LoadingState";
import { formatStatusLabel, StatusBadge, statusToTone } from "@/components/ui/StatusBadge";
import { buttonVariants } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatCurrency";
import { useCards } from "@/hooks/useCards";
import { postJson } from "@/lib/clientApi";
import { cn } from "@/lib/utils";
import type { CardApplicationRecord, CardsData, CardTransactionSummary, CardType } from "@/types/banking";

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
        No purchases on this card yet.
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

function ApplicationStatusCard({ application }: { application: CardApplicationRecord }) {
  return (
    <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-primary-navy dark:text-white">
            {application.cardType} Mastercard
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
      {application.status === "PENDING" ? (
        <p className="mt-3 text-sm text-bluewave-gray dark:text-white/[0.62]">
          We&apos;ll notify you when your application is reviewed.
        </p>
      ) : null}
      {application.reviewNote ? (
        <p className="mt-3 text-sm text-bluewave-gray dark:text-white/[0.62]">
          Note: {application.reviewNote}
        </p>
      ) : null}
    </article>
  );
}

function ApplyCardPanel({
  accounts,
  cards,
  applications,
  onApplied,
}: {
  accounts: CardsData["accounts"];
  cards: CardsData["cards"];
  applications: CardsData["applications"];
  onApplied: () => Promise<void>;
}) {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [cardType, setCardType] = useState<CardType>("DEBIT");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (accounts.some((account) => account.id === accountId)) {
      return;
    }

    setAccountId(accounts[0]?.id ?? "");
  }, [accountId, accounts]);

  const pendingApplication = useMemo(
    () =>
      applications.find(
        (application) =>
          application.status === "PENDING" &&
          application.accountId === accountId &&
          application.cardType === cardType,
      ),
    [accountId, applications, cardType],
  );

  const hasActiveCard = useMemo(
    () =>
      cards.some(
        (card) =>
          card.accountId === accountId &&
          card.cardType === cardType &&
          (card.status === "ACTIVE" || card.status === "LOCKED"),
      ),
    [accountId, cardType, cards],
  );

  const canApply = !pendingApplication && !hasActiveCard;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!canApply) {
      return;
    }

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
      <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]">
        <p className="text-sm text-bluewave-gray dark:text-white/[0.62]">
          You need an active account before applying.{" "}
          <Link href="/auth/accounts" className="font-semibold text-royal-blue dark:text-light-blue">
            View accounts
          </Link>
        </p>
      </article>
    );
  }

  return (
    <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_12px_40px_rgba(10,42,94,0.06)] dark:border-white/[0.08] dark:bg-white/[0.06]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <form onSubmit={(event) => void handleSubmit(event)} className="grid flex-1 gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
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

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSubmitting || !canApply}
              className={buttonVariants({
                className: "w-full disabled:cursor-not-allowed disabled:opacity-60",
              })}
            >
              <Plus size={18} aria-hidden="true" />
              {isSubmitting ? "Submitting..." : "Apply for card"}
            </button>
          </div>

          {pendingApplication ? (
            <p className="md:col-span-2 text-sm text-bluewave-gray dark:text-white/[0.62]">
              This account already has a {cardType.toLowerCase()} application under review.
            </p>
          ) : null}
          {hasActiveCard ? (
            <p className="md:col-span-2 text-sm text-bluewave-gray dark:text-white/[0.62]">
              This account already has an active {cardType.toLowerCase()} card.
            </p>
          ) : null}
          {error ? <p className="md:col-span-2 text-sm text-red-700 dark:text-red-300">{error}</p> : null}
          {success ? (
            <p className="md:col-span-2 text-sm text-emerald-700 dark:text-emerald-300">{success}</p>
          ) : null}
        </form>

        <BluewaveMastercard
          cardholderName="Your Name"
          maskedPan="5529 01•• •••• ••••"
          expiryLabel="••/••"
          cardType={cardType}
          className="mx-auto w-full max-w-[300px] shrink-0 lg:mx-0"
        />
      </div>
    </article>
  );
}

export function CardsClient() {
  const { data, error, isLoading, refetch } = useCards();
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [pendingCardId, setPendingCardId] = useState<string | null>(null);

  const openApplications = useMemo(
    () => data?.applications.filter((application) => application.status !== "APPROVED") ?? [],
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
      <ApplyCardPanel
        accounts={data.accounts}
        cards={data.cards}
        applications={data.applications}
        onApplied={refetch}
      />

      {openApplications.map((application) => (
        <ApplicationStatusCard key={application.id} application={application} />
      ))}

      {data.cards.length === 0 && openApplications.length === 0 ? (
        <EmptyState title="No cards yet" message="Apply above to request your first Mastercard." />
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

            <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_12px_40px_rgba(10,42,94,0.06)] dark:border-white/[0.08] dark:bg-white/[0.06]">
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
                    {card.network}
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

            <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_12px_40px_rgba(10,42,94,0.06)] dark:border-white/[0.08] dark:bg-white/[0.06]">
              <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Card activity</h2>
              <div className="mt-4">
                <CardTransactionsPanel cardId={card.id} />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_12px_40px_rgba(10,42,94,0.06)] dark:border-white/[0.08] dark:bg-white/[0.06]">
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
