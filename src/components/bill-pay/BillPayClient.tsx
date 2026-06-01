"use client";

import { useState } from "react";
import { Receipt, Send, Users } from "lucide-react";
import { BillPaymentForm } from "@/components/bill-pay/BillPaymentForm";
import { BillPaymentList } from "@/components/bill-pay/BillPaymentList";
import { PayBillNowForm } from "@/components/bill-pay/PayBillNowForm";
import { PayeeManager } from "@/components/bill-pay/PayeeManager";
import { cn } from "@/lib/utils";

type BillPayTab = "pay" | "payees" | "payments" | "schedule";

const tabs = [
  { id: "pay" as const, label: "Pay bill", icon: Send },
  { id: "payees" as const, label: "Payees", icon: Users },
  { id: "payments" as const, label: "Payment history", icon: Receipt },
] as const;

export function BillPayClient() {
  const [activeTab, setActiveTab] = useState<BillPayTab>("pay");
  const [showSchedule, setShowSchedule] = useState(false);

  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = !showSchedule && activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setShowSchedule(false);
                setActiveTab(tab.id);
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition",
                isActive
                  ? "bg-ocean-blue text-primary-navy shadow-[0_12px_32px_rgba(0,168,232,0.28)]"
                  : "border border-primary-navy/[0.10] bg-white text-primary-navy dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white",
              )}
            >
              <Icon size={16} aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setShowSchedule(true)}
          className={cn(
            "rounded-full px-4 py-2.5 text-sm font-semibold transition",
            showSchedule
              ? "bg-ocean-blue text-primary-navy"
              : "border border-primary-navy/[0.10] bg-white text-primary-navy dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white",
          )}
        >
          Schedule payment
        </button>
      </div>

      {showSchedule ? <BillPaymentForm defaultSubmitForReview /> : null}
      {!showSchedule && activeTab === "pay" ? <PayBillNowForm /> : null}
      {!showSchedule && activeTab === "payees" ? <PayeeManager /> : null}
      {!showSchedule && activeTab === "payments" ? (
        <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
          <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Payment history</h2>
          <div className="mt-4">
            <BillPaymentList />
          </div>
        </div>
      ) : null}
    </section>
  );
}
