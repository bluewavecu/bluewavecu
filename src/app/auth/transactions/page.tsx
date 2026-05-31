import { Suspense } from "react";
import { TransactionsClient } from "@/components/transactions/TransactionsClient";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingState } from "@/components/ui/LoadingState";

export default function TransactionsPage() {
  return (
    <AppShell
      title="Transactions"
      subtitle="Your account activity and posted history."
      hideHeaderSearch
    >
      <Suspense
        fallback={
          <LoadingState
            title="Loading transactions"
            message="Retrieving your transaction activity."
          />
        }
      >
        <TransactionsClient />
      </Suspense>
    </AppShell>
  );
}
