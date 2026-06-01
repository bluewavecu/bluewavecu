"use client";

import { useState } from "react";
import { BillPaymentForm } from "@/components/bill-pay/BillPaymentForm";
import { BillPaymentList } from "@/components/bill-pay/BillPaymentList";
import { PayBillNowForm } from "@/components/bill-pay/PayBillNowForm";
import { PayeeManager } from "@/components/bill-pay/PayeeManager";
import { cn } from "@/lib/utils";

type BillPayTab = "pay" | "payees" | "payments" | "schedule";

export function BillPayClient() {
  const [activeTab, setActiveTab] = useState<BillPayTab>("pay");

  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {[
          { id: "pay" as const, label: "Pay bill" },
          { id: "payees" as const, label: "Payees" },
          { id: "payments" as const, label: "Bill payments" },
          { id: "schedule" as const, label: "Schedule" },
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

      {activeTab === "pay" ? <PayBillNowForm /> : null}
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
