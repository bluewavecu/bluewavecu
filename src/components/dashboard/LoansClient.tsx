"use client";

import { BadgeCheck, Calculator, Landmark } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/lib/formatCurrency";
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
    return <LoadingState title="Loading loans" message="Retrieving your loan accounts." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const loan = data?.loans[0];

  if (!loan) {
    return (
      <EmptyState
        title="No loan records found"
        message="No loans are on file yet. Submit an application or contact lending services."
      />
    );
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-6 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
        <Landmark size={26} className="text-ocean-blue" aria-hidden="true" />
        <h2 className="mt-5 text-2xl font-semibold text-primary-navy dark:text-white">
          {loan.loanType} loan
        </h2>
        <p className="mt-4 text-5xl font-semibold text-primary-navy dark:text-white">
          {formatCurrency(loan.principal)}
        </p>
        <p className="mt-2 text-sm font-semibold text-royal-blue dark:text-light-blue">
          {loan.interestRate > 0
            ? `${loan.interestRate.toFixed(2)}% APR`
            : "Rate disclosed at closing"}
        </p>
        <p className="mt-5 max-w-xl text-sm leading-6 text-bluewave-gray dark:text-white/[0.62]">
          {getStatusLabel(loan.status)} — remaining balance {formatCurrency(loan.balance)} with a
          monthly payment of {formatCurrency(loan.monthlyPayment)}.
        </p>
        <Link
          href="/auth/loans"
          className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy transition hover:bg-light-blue"
        >
          View loan details
          <BadgeCheck size={17} aria-hidden="true" />
        </Link>
      </div>

      <div className="rounded-lg border border-primary-navy/[0.08] bg-primary-navy p-6 text-white shadow-[0_18px_60px_rgba(10,42,94,0.12)]">
        <Calculator size={26} className="text-light-blue" aria-hidden="true" />
        <h2 className="mt-5 text-2xl font-semibold">Loan servicing snapshot</h2>
        <p className="mt-3 text-sm leading-6 text-white/[0.68]">
          Your loan is serviced in online banking with payment history, payoff estimates, and secure
          messaging with our lending team.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            `Monthly payment: ${formatCurrency(loan.monthlyPayment)}`,
            `Status: ${getStatusLabel(loan.status)}`,
            `Term: ${loan.termMonths} months`,
            `Balance: ${formatCurrency(loan.balance)}`,
          ].map((item) => (
            <div key={item} className="rounded-lg border border-white/[0.12] bg-white/[0.08] p-4">
              <p className="font-semibold">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
