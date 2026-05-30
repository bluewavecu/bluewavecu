"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Calculator, Landmark } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/data/mockBanking";
import { useLoans } from "@/hooks/useLoans";

function getStatusLabel(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function estimateMonthlyPayment(principal: number, annualRate: number, termMonths: number) {
  if (principal <= 0 || termMonths <= 0) {
    return 0;
  }

  const monthlyRate = annualRate / 100 / 12;

  if (monthlyRate === 0) {
    return principal / termMonths;
  }

  const factor = Math.pow(1 + monthlyRate, termMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

export function LoansClient() {
  const { data, error, isLoading, refetch } = useLoans();
  const primaryOffer = data?.offers[0];
  const [estimateAmount, setEstimateAmount] = useState(
    primaryOffer ? String(primaryOffer.preApprovedAmount) : "25000",
  );
  const [estimateTerm, setEstimateTerm] = useState(
    primaryOffer ? String(primaryOffer.termMonths) : "48",
  );

  const estimate = useMemo(() => {
    const principal = Number.parseFloat(estimateAmount) || 0;
    const termMonths = Number.parseInt(estimateTerm, 10) || 0;
    const demoRate = 8.99;
    const monthlyPayment = estimateMonthlyPayment(principal, demoRate, termMonths);

    return {
      principal,
      termMonths,
      demoRate,
      monthlyPayment,
    };
  }, [estimateAmount, estimateTerm]);

  if (isLoading) {
    return <LoadingState title="Loading loans" message="Retrieving authenticated loan data." />;
  }

  if (error) {
    return <ApiErrorState message={error} onRetry={refetch} />;
  }

  if (!data) {
    return (
      <EmptyState
        title="No loan data"
        message="Sign in with a seeded demo member account to review loans."
      />
    );
  }

  const activeLoans = data.loans.filter((loan) => loan.status === "ACTIVE");
  const otherLoans = data.loans.filter((loan) => loan.status !== "ACTIVE");

  return (
    <section className="grid gap-5">
      {activeLoans.length > 0 ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {activeLoans.map((loan) => (
            <article
              key={loan.id}
              className="rounded-lg border border-primary-navy/[0.08] bg-white p-6 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
            >
              <Landmark size={26} className="text-ocean-blue" aria-hidden="true" />
              <h2 className="mt-5 text-2xl font-semibold text-primary-navy dark:text-white">
                {loan.loanType}
              </h2>
              <p className="mt-2 text-sm font-semibold text-royal-blue dark:text-light-blue">
                {getStatusLabel(loan.status)}
              </p>
              <p className="mt-4 text-4xl font-semibold text-primary-navy dark:text-white">
                {formatCurrency(loan.balance)}
              </p>
              <p className="mt-2 text-sm text-bluewave-gray dark:text-white/[0.58]">
                Remaining balance across {loan.termMonths} months
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-[#f7fbff] p-4 dark:bg-white/[0.05]">
                  <p className="text-xs uppercase text-bluewave-gray dark:text-white/[0.48]">
                    Monthly payment
                  </p>
                  <p className="mt-2 font-semibold text-primary-navy dark:text-white">
                    {formatCurrency(loan.monthlyPayment)}
                  </p>
                </div>
                <div className="rounded-lg bg-[#f7fbff] p-4 dark:bg-white/[0.05]">
                  <p className="text-xs uppercase text-bluewave-gray dark:text-white/[0.48]">
                    Interest rate
                  </p>
                  <p className="mt-2 font-semibold text-primary-navy dark:text-white">
                    {loan.interestRate.toFixed(2)}%
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {otherLoans.length > 0 ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {otherLoans.map((loan) => (
            <article
              key={loan.id}
              className="rounded-lg border border-primary-navy/[0.08] bg-white p-6 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
            >
              <h2 className="text-xl font-semibold text-primary-navy dark:text-white">
                {loan.loanType}
              </h2>
              <p className="mt-2 text-sm text-bluewave-gray dark:text-white/[0.58]">
                {getStatusLabel(loan.status)} application record
              </p>
              <p className="mt-4 text-3xl font-semibold text-primary-navy dark:text-white">
                {formatCurrency(loan.principal)}
              </p>
            </article>
          ))}
        </div>
      ) : null}

      {data.loans.length === 0 && data.offers.length === 0 ? (
        <EmptyState
          title="No loan records found"
          message="Seed demo lending data or add loan application flows before reviewing loans."
        />
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        {primaryOffer ? (
          <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-6 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
            <Landmark size={26} className="text-ocean-blue" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-semibold text-primary-navy dark:text-white">
              {primaryOffer.title}
            </h2>
            <p className="mt-4 text-5xl font-semibold text-primary-navy dark:text-white">
              {formatCurrency(primaryOffer.preApprovedAmount)}
            </p>
            <p className="mt-2 text-sm font-semibold text-royal-blue dark:text-light-blue">
              Demo pre-qualification up to {primaryOffer.rateRange}
            </p>
            <p className="mt-5 max-w-xl text-sm leading-6 text-bluewave-gray dark:text-white/[0.62]">
              {primaryOffer.description}
            </p>
            <p className="mt-4 text-xs leading-5 text-bluewave-gray dark:text-white/[0.48]">
              {primaryOffer.disclaimer}
            </p>
            <button
              type="button"
              disabled
              className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ocean-blue/[0.40] px-5 text-sm font-semibold text-primary-navy opacity-80"
            >
              Explore Demo Offer
              <BadgeCheck size={17} aria-hidden="true" />
            </button>
          </div>
        ) : null}

        <div className="rounded-lg border border-primary-navy/[0.08] bg-primary-navy p-6 text-white shadow-[0_18px_60px_rgba(10,42,94,0.12)]">
          <Calculator size={26} className="text-light-blue" aria-hidden="true" />
          <h2 className="mt-5 text-2xl font-semibold">Payment estimate calculator</h2>
          <p className="mt-3 text-sm leading-6 text-white/[0.68]">
            Sample calculator for demo planning only. This is not an approval or rate guarantee.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold">Loan amount</span>
              <input
                type="number"
                min="1000"
                step="500"
                value={estimateAmount}
                onChange={(event) => setEstimateAmount(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/[0.12] bg-white/[0.08] px-4 py-3 text-sm text-white outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Term (months)</span>
              <input
                type="number"
                min="12"
                step="12"
                value={estimateTerm}
                onChange={(event) => setEstimateTerm(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/[0.12] bg-white/[0.08] px-4 py-3 text-sm text-white outline-none"
              />
            </label>
          </div>

          <div className="mt-6 rounded-lg border border-white/[0.12] bg-white/[0.08] p-4">
            <p className="text-sm text-white/[0.68]">Estimated monthly payment</p>
            <p className="mt-2 text-3xl font-semibold">
              {formatCurrency(estimate.monthlyPayment)}
            </p>
            <p className="mt-2 text-xs text-white/[0.54]">
              Based on a demo {estimate.demoRate.toFixed(2)}% APR over {estimate.termMonths} months.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
