"use client";

import { PayeeManager } from "@/components/bill-pay/PayeeManager";
import { InfoPanel } from "@/components/ui/InfoPanel";

export function PayeesClient() {
  return (
    <section className="grid gap-5">
      <InfoPanel title="Recipients & payees">
        Manage bill pay recipients here. Routing and account numbers are masked on this screen.
        Payments post after member services review.
      </InfoPanel>
      <PayeeManager />
    </section>
  );
}
