"use client";

import { BadgeCheck, Calculator, Landmark } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/data/mockBanking";
import { useDashboardData } from "@/hooks/useDashboardData";

function getStatusLabel(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function LoansClient() {
  const { data, error, isLoading, refetch } = useDashboardData();

  if (isLoading) {
    return <LoadingState title="Loading loans" message="Retrieving authenticated loan data." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const loan = data?.loans[0];

  if (!loan) {
    return (
      <EmptyState
        title="No loan records found"
        message="Seed demo lending data or add loan application flows before reviewing loans."
      />
    );
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-6 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
        <Landmark size={26} className="text-ocean-blue" aria-hidden="true" />
        <h2 className="mt-5 text-2xl font-semibold text-primary-navy dark:text-white">
          {loan.loanType} preview
        </h2>
        <p className="mt-4 text-5xl font-semibold text-primary-navy dark:text-white">
          {formatCurrency(loan.principal)}
        </p>
        <p className="mt-2 text-sm font-semibold text-royal-blue dark:text-light-blue">
          {loan.interestRate > 0
            ? `${loan.interestRate.toFixed(2)}% rate placeholder`
            : "Rate placeholder"}
        </p>
        <p className="mt-5 max-w-xl text-sm leading-6 text-bluewave-gray dark:text-white/[0.62]">
          {getStatusLabel(loan.status)} lending record prepared for future eligibility,
          application, and servicing workflows.
        </p>
        <button
          type="button"
          className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy transition hover:bg-light-blue"
        >
          Review Preview
          <BadgeCheck size={17} aria-hidden="true" />
        </button>
      </div>

      <div className="rounded-lg border border-primary-navy/[0.08] bg-primary-navy p-6 text-white shadow-[0_18px_60px_rgba(10,42,94,0.12)]">
        <Calculator size={26} className="text-light-blue" aria-hidden="true" />
        <h2 className="mt-5 text-2xl font-semibold">Loan servicing snapshot</h2>
        <p className="mt-3 text-sm leading-6 text-white/[0.68]">
          Balance {formatCurrency(loan.balance)} across {loan.termMonths} months. Full
          calculators, applications, and document flows remain pending Step 6 APIs.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            `Monthly payment: ${formatCurrency(loan.monthlyPayment)}`,
            `Status: ${getStatusLabel(loan.status)}`,
            "Document upload pending",
            "Eligibility workflow pending",
          ].map((item) => (
            <div key={item} className="rounded-lg border border-white/[0.12] bg-white/[0.08] p-4">
              <p className="font-semibold">{item}</p>
              <p className="mt-1 text-xs text-white/[0.54]">API-ready placeholder</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
