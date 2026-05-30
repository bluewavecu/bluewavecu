"use client";

import { PayeeManager } from "@/components/bill-pay/PayeeManager";
import { InfoPanel } from "@/components/ui/InfoPanel";

export function PayeesClient() {
  return (
    <section className="grid gap-5">
      <InfoPanel title="Recipients & payees">
        Manage bill pay recipients here. Account numbers are stored securely and never displayed in
        full on this screen. Payments created from payees still require admin review before posting.
      </InfoPanel>
      <PayeeManager />
    </section>
  );
}
