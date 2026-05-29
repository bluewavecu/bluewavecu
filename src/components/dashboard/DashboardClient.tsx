"use client";

import { AlertTriangle, CircleHelp, RefreshCw, ShieldCheck } from "lucide-react";
import { AccountOverview } from "@/components/dashboard/AccountOverview";
import { BalanceCards } from "@/components/dashboard/BalanceCards";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useDashboardData } from "@/hooks/useDashboardData";

const skeletonCards = ["balance", "savings", "card"];

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <LoadingState
        title="Loading dashboard"
        message="Retrieving authenticated account, card, transaction, loan, and support data."
      />
      <section className="grid gap-4 lg:grid-cols-3">
        {skeletonCards.map((item) => (
          <div
            key={item}
            className="h-56 animate-pulse rounded-lg border border-primary-navy/[0.08] bg-white shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
          >
            <div className="h-2 rounded-t-lg bg-ocean-blue/[0.28]" />
            <div className="space-y-5 p-5">
              <div className="h-4 w-24 rounded-full bg-primary-navy/[0.08] dark:bg-white/[0.10]" />
              <div className="h-5 w-44 rounded-full bg-primary-navy/[0.10] dark:bg-white/[0.14]" />
              <div className="h-9 w-32 rounded-full bg-primary-navy/[0.10] dark:bg-white/[0.14]" />
              <div className="h-4 w-full rounded-full bg-primary-navy/[0.08] dark:bg-white/[0.10]" />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export function DashboardClient() {
  const { data, error, isLoading, refetch } = useDashboardData();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        title="Dashboard unavailable"
        message={error}
        actionLabel="Reload Dashboard"
        onRetry={refetch}
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="No dashboard data"
        message="Sign in with a seeded demo member account to load authenticated banking data."
      />
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-ocean-blue/[0.10] px-3 py-1 text-xs font-semibold text-royal-blue dark:text-light-blue">
              <ShieldCheck size={14} aria-hidden="true" />
              Authenticated dashboard
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-primary-navy dark:text-white">
              Welcome back, {data.user.firstName}
            </h2>
            <p className="mt-1 text-sm leading-6 text-bluewave-gray dark:text-white/[0.62]">
              Live account summaries are loaded from the protected dashboard API.
            </p>
          </div>
          <button
            type="button"
            onClick={refetch}
            className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-full border border-primary-navy/[0.10] bg-[#f7fbff] px-4 text-sm font-semibold text-primary-navy transition hover:border-ocean-blue/[0.40] hover:text-royal-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Refresh
          </button>
        </div>
      </section>

      {data.accounts.length > 0 ? (
        <BalanceCards accounts={data.accounts} />
      ) : (
        <EmptyState
          title="No accounts found"
          message="Seed demo banking data or wait for account creation flows before reviewing balances."
        />
      )}

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <QuickActions />
        <RecentTransactions transactions={data.recentTransactions} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <AccountOverview accounts={data.accounts} loans={data.loans} />
        <div className="grid gap-5">
          <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
            <div className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue dark:text-light-blue">
                <AlertTriangle size={21} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
                  Security notice
                </h2>
                <p className="mt-3 text-sm leading-6 text-bluewave-gray dark:text-white/[0.62]">
                  This dashboard now requires a valid Bluewave session cookie. Transfers
                  still create pending records only and do not move real money.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-primary-navy/[0.08] bg-primary-navy p-5 text-white shadow-[0_18px_60px_rgba(10,42,94,0.12)]">
            <div className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-light-blue/[0.16] text-light-blue">
                <CircleHelp size={21} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Support summary</h2>
                <p className="mt-3 text-sm leading-6 text-white/[0.68]">
                  {data.supportTicketSummary.open} open and{" "}
                  {data.supportTicketSummary.pending} pending support tickets from{" "}
                  {data.supportTicketSummary.total} total demo records.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
