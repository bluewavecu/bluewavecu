"use client";

import { useState } from "react";
import {
  CreditCard,
  Globe,
  KeyRound,
  LockKeyhole,
  Plane,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { InfoPanel } from "@/components/ui/InfoPanel";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatStatusLabel, StatusBadge, statusToTone } from "@/components/ui/StatusBadge";
import { formatCurrency } from "@/data/mockBanking";
import { useCards } from "@/hooks/useCards";
import { postJson } from "@/lib/clientApi";
import { cn } from "@/lib/utils";

const cardControls = [
  { action: "LOCK" as const, label: "Lock Card", icon: LockKeyhole },
  { action: "REPORT_LOST" as const, label: "Report Lost/Stolen", icon: ShieldAlert },
  { action: "REQUEST_REPLACEMENT" as const, label: "Request Replacement", icon: RefreshCw },
  { action: "TRAVEL_NOTICE" as const, label: "Travel Notice", icon: Plane },
  { action: "UPDATE_SPENDING_LIMIT" as const, label: "Spending Limits", icon: KeyRound },
];

export function CardsClient() {
  const { data, error, isLoading, refetch } = useCards();
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [pendingCardId, setPendingCardId] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingState title="Loading cards" message="Retrieving authenticated card data." />;
  }

  if (error) {
    return <ApiErrorState message={error} onRetry={refetch} />;
  }

  if (!data || data.cards.length === 0) {
    return (
      <EmptyState
        title="No cards found"
        message="Seed demo card data or add card issuing flows before managing cards."
      />
    );
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
      <InfoPanel title="Card management">
        Card controls submit support requests for demo workflows. No card status changes automatically
        and full card numbers are never displayed.
      </InfoPanel>

      {actionMessage ? (
        <p className="rounded-lg border border-ocean-blue/[0.20] bg-ocean-blue/[0.08] px-4 py-3 text-sm font-medium text-royal-blue dark:text-light-blue">
          {actionMessage}
        </p>
      ) : null}

      {data.cards.map((card) => (
        <div key={card.id} className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-lg bg-[linear-gradient(135deg,#0A2A5E,#0D47A1_62%,#00A8E8)] p-6 text-white shadow-[0_22px_80px_rgba(10,42,94,0.20)]">
            <div className="flex items-start justify-between">
              <CreditCard size={28} className="text-light-blue" aria-hidden="true" />
              <StatusBadge
                label={formatStatusLabel(card.status)}
                tone={statusToTone(card.status)}
                className="bg-white/[0.12] text-white"
              />
            </div>
            <p className="mt-14 text-sm uppercase tracking-[0.18em] text-white/[0.54]">
              {card.cardType === "CREDIT" ? "Bluewave Rewards Credit" : "Bluewave Debit"}
            </p>
            <p className="mt-4 text-2xl font-semibold">**** {card.last4}</p>
            <p className="mt-2 text-sm text-white/[0.68]">{card.cardholderName}</p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-white/[0.50]">Linked account</p>
                <p className="mt-2 text-lg font-semibold">{card.linkedAccount.displayName}</p>
                <p className="mt-1 text-sm text-white/[0.58]">
                  {card.linkedAccount.maskedAccountNumber}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-white/[0.50]">Spending limit</p>
                <p className="mt-2 text-xl font-semibold">{formatCurrency(card.spendingLimit)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
            <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
              Card controls
            </h2>
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
