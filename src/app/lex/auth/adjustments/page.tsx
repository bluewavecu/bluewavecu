import { Suspense } from "react";
import { AdminAdjustmentsClient } from "@/components/admin/AdminAdjustmentsClient";
import { AdminShell } from "@/components/admin/AdminShell";
import { LoadingState } from "@/components/ui/LoadingState";

export default function AdminAdjustmentsPage() {
  return (
    <AdminShell
      title="Fund User Account"
      subtitle="Credit or debit member accounts with a scheduled effective date."
    >
      <Suspense
        fallback={
          <LoadingState title="Loading adjustments" message="Retrieving credit and debit tools." />
        }
      >
        <AdminAdjustmentsClient />
      </Suspense>
    </AdminShell>
  );
}
