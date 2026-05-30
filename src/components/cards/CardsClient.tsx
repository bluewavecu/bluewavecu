"use client";

import { CreditCard, KeyRound, LockKeyhole, RefreshCw } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/data/mockBanking";
import { useCards } from "@/hooks/useCards";
import { cn } from "@/lib/utils";

const cardControls = [
  { label: "Lock Card", icon: LockKeyhole },
  { label: "Replace Card", icon: RefreshCw },
  { label: "View PIN", icon: KeyRound },
];

function getStatusLabel(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function CardsClient() {
  const { data, error, isLoading, refetch } = useCards();

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

  return (
    <section className="grid gap-5">
      {data.cards.map((card) => (
        <div key={card.id} className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-lg bg-[linear-gradient(135deg,#0A2A5E,#0D47A1_62%,#00A8E8)] p-6 text-white shadow-[0_22px_80px_rgba(10,42,94,0.20)]">
            <div className="flex items-start justify-between">
              <CreditCard size={28} className="text-light-blue" aria-hidden="true" />
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  card.status === "ACTIVE"
                    ? "bg-white/[0.12]"
                    : "bg-amber-500/[0.20] text-amber-100",
                )}
              >
                {getStatusLabel(card.status)}
              </span>
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

                return (
                  <button
                    key={`${card.id}-${control.label}`}
                    type="button"
                    disabled
                    title="Coming soon"
                    className="flex items-center justify-between rounded-lg border border-primary-navy/[0.08] bg-[#f7fbff] p-4 text-left opacity-70 dark:border-white/[0.08] dark:bg-white/[0.05]"
                  >
                    <span className="flex items-center gap-3 text-sm font-semibold text-primary-navy dark:text-white">
                      <Icon size={18} className="text-royal-blue dark:text-light-blue" aria-hidden="true" />
                      {control.label}
                    </span>
                    <span className="text-xs font-semibold text-bluewave-gray dark:text-white/[0.48]">
                      Coming soon
                    </span>
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
