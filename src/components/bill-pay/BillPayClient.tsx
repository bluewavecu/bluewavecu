"use client";

import { useState } from "react";
import { BillPaymentForm } from "@/components/bill-pay/BillPaymentForm";
import { BillPaymentList } from "@/components/bill-pay/BillPaymentList";
import { PayeeManager } from "@/components/bill-pay/PayeeManager";
import { cn } from "@/lib/utils";

type BillPayTab = "payees" | "payments" | "schedule";

export function BillPayClient() {
  const [activeTab, setActiveTab] = useState<BillPayTab>("payees");

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-primary-navy/[0.08] bg-primary-navy p-5 text-white">
        <h2 className="text-lg font-semibold">Bill pay processing</h2>
        <p className="mt-2 text-sm leading-6 text-white/[0.68]">
          Bill payments are reviewed by member services before posting. Account balances update only
          after approval is complete.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: "payees" as const, label: "Payees" },
          { id: "payments" as const, label: "Bill Payments" },
          { id: "schedule" as const, label: "Schedule Payment" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              activeTab === tab.id
                ? "bg-ocean-blue text-primary-navy"
                : "border border-primary-navy/[0.10] bg-white text-primary-navy dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "payees" ? <PayeeManager /> : null}
      {activeTab === "payments" ? (
        <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
          <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Bill payments</h2>
          <div className="mt-4">
            <BillPaymentList />
          </div>
        </div>
      ) : null}
      {activeTab === "schedule" ? <BillPaymentForm defaultSubmitForReview /> : null}
    </section>
  );
}
