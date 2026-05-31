"use client";

import { CreditCard, LockKeyhole, Snowflake, Wifi } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/lib/formatCurrency";
import { useDashboardData } from "@/hooks/useDashboardData";

const cardControls = [
  { label: "Lock card", icon: LockKeyhole },
  { label: "Freeze online purchases", icon: Snowflake },
  { label: "Contactless controls", icon: Wifi },
];

export function CardsClient() {
  const { data, error, isLoading, refetch } = useDashboardData();

  if (isLoading) {
    return <LoadingState title="Loading cards" message="Retrieving authenticated card data." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const card = data?.cards[0];
  const account = card
    ? data?.accounts.find((accountItem) => accountItem.id === card.accountId)
    : undefined;

  if (!card) {
    return (
      <EmptyState
        title="No cards found"
        message="No cards are linked to your membership yet. Contact member services to request a debit or credit card."
      />
    );
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
      <div className="rounded-lg bg-[linear-gradient(135deg,#0A2A5E,#0D47A1_62%,#00A8E8)] p-6 text-white shadow-[0_22px_80px_rgba(10,42,94,0.20)]">
        <div className="flex items-start justify-between">
          <CreditCard size={28} className="text-light-blue" aria-hidden="true" />
          <span className="rounded-full bg-white/[0.12] px-3 py-1 text-xs font-semibold">
            {card.status}
          </span>
        </div>
        <p className="mt-14 text-sm uppercase tracking-[0.18em] text-white/[0.54]">
          {card.cardType === "CREDIT" ? "Bluewave Rewards" : "Bluewave Debit"}
        </p>
        <p className="mt-4 text-2xl font-semibold">**** {card.last4}</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase text-white/[0.50]">Current balance</p>
            <p className="mt-2 text-xl font-semibold">
              {formatCurrency(account?.balance ?? 0)}
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
                key={control.label}
                type="button"
                className="flex items-center justify-between rounded-lg border border-primary-navy/[0.08] bg-[#f7fbff] p-4 text-left transition hover:border-ocean-blue/[0.40] dark:border-white/[0.08] dark:bg-white/[0.05]"
              >
                <span className="flex items-center gap-3 text-sm font-semibold text-primary-navy dark:text-white">
                  <Icon size={18} className="text-royal-blue dark:text-light-blue" aria-hidden="true" />
                  {control.label}
                </span>
                <span className="h-6 w-11 rounded-full bg-ocean-blue/[0.18]" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
