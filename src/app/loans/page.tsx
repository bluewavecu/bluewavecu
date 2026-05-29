import { BadgeCheck, Calculator, Landmark } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { loanOffer } from "@/data/mockBanking";

export default function LoansPage() {
  return (
    <AppShell
      title="Loans"
      subtitle="A lending center foundation for future eligibility, applications, and servicing workflows."
    >
      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-6 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
          <Landmark size={26} className="text-ocean-blue" aria-hidden="true" />
          <h2 className="mt-5 text-2xl font-semibold text-primary-navy dark:text-white">
            {loanOffer.title}
          </h2>
          <p className="mt-4 text-5xl font-semibold text-primary-navy dark:text-white">
            {loanOffer.amount}
          </p>
          <p className="mt-2 text-sm font-semibold text-royal-blue dark:text-light-blue">
            {loanOffer.rateLabel}
          </p>
          <p className="mt-5 max-w-xl text-sm leading-6 text-bluewave-gray dark:text-white/[0.62]">
            {loanOffer.description}
          </p>
          <button
            type="button"
            className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy transition hover:bg-light-blue"
          >
            Start Preview
            <BadgeCheck size={17} aria-hidden="true" />
          </button>
        </div>

        <div className="rounded-lg border border-primary-navy/[0.08] bg-primary-navy p-6 text-white shadow-[0_18px_60px_rgba(10,42,94,0.12)]">
          <Calculator size={26} className="text-light-blue" aria-hidden="true" />
          <h2 className="mt-5 text-2xl font-semibold">Loan calculator placeholder</h2>
          <p className="mt-3 text-sm leading-6 text-white/[0.68]">
            Reserve space for amount, term, payment estimate, and document upload flows
            once verified lending requirements are available.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {["Personal loan", "Auto loan", "Home equity", "Credit builder"].map((item) => (
              <div key={item} className="rounded-lg border border-white/[0.12] bg-white/[0.08] p-4">
                <p className="font-semibold">{item}</p>
                <p className="mt-1 text-xs text-white/[0.54]">Product placeholder</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
