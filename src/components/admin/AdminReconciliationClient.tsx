"use client";

import { AdminStatCards } from "@/components/admin/AdminStatCards";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/data/mockBanking";
import { useAdminReconciliation } from "@/hooks/useAdminReconciliation";
import { cn } from "@/lib/utils";

function statusBadgeClass(status: string) {
  if (status === "MATCH") {
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  }

  if (status === "MISMATCH") {
    return "bg-red-500/15 text-red-700 dark:text-red-300";
  }

  return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
}

export function AdminReconciliationClient() {
  const { data, error, isLoading, isForbidden, refetch } = useAdminReconciliation();

  if (isLoading) {
    return <LoadingState title="Loading reconciliation" message="Comparing account and ledger balances." />;
  }

  if (error) {
    return (
      <ApiErrorState
        message={isForbidden ? "Admin access required." : error}
        onRetry={isForbidden ? undefined : refetch}
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="Reconciliation unavailable"
        message="Reconciliation data could not be loaded. Refresh the page or try again later."
      />
    );
  }

  return (
    <section className="grid gap-5">
      <article className="rounded-lg border border-primary-navy/[0.08] bg-[#f7fbff] p-4 text-sm dark:border-white/[0.08] dark:bg-white/[0.04]">
        <p className="font-semibold text-primary-navy dark:text-white">Read-only reconciliation</p>
        <p className="mt-2 text-bluewave-gray dark:text-white/[0.70]">
          Reconciliation reports are read-only. Corrections require a future controlled adjustment
          workflow.
        </p>
      </article>

      <AdminStatCards
        items={[
          { label: "Active accounts", value: data.totals.accountCount },
          { label: "Mismatch / no ledger", value: data.totals.mismatchCount },
          { label: "Total account balance", value: formatCurrency(data.totals.accountBalance) },
          { label: "Total ledger balance", value: formatCurrency(data.totals.ledgerBalance) },
        ]}
      />

      <AdminStatCards
        items={[
          { label: "Ledger debits", value: formatCurrency(data.totals.totalDebits) },
          { label: "Ledger credits", value: formatCurrency(data.totals.totalCredits) },
        ]}
        className="sm:grid-cols-2"
      />

      <div className="overflow-x-auto rounded-lg border border-primary-navy/[0.08] bg-white dark:border-white/[0.08] dark:bg-white/[0.06]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-primary-navy/[0.08] bg-[#f7fbff] dark:border-white/[0.08] dark:bg-white/[0.04]">
            <tr>
              <th className="px-4 py-3 font-semibold">Account</th>
              <th className="px-4 py-3 font-semibold">Member</th>
              <th className="px-4 py-3 font-semibold">Account balance</th>
              <th className="px-4 py-3 font-semibold">Ledger balance</th>
              <th className="px-4 py-3 font-semibold">Delta</th>
              <th className="px-4 py-3 font-semibold">Debits</th>
              <th className="px-4 py-3 font-semibold">Credits</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.accounts.map((account) => (
              <tr
                key={account.accountId}
                className="border-b border-primary-navy/[0.06] dark:border-white/[0.06]"
              >
                <td className="px-4 py-3">
                  <p className="font-medium">{account.accountType}</p>
                  <p className="text-xs text-bluewave-gray dark:text-white/[0.58]">
                    ****{account.accountNumber.slice(-4)}
                  </p>
                </td>
                <td className="px-4 py-3">{account.userName}</td>
                <td className="px-4 py-3">{formatCurrency(account.accountBalance)}</td>
                <td className="px-4 py-3">{formatCurrency(account.ledgerBalance)}</td>
                <td className="px-4 py-3">{formatCurrency(account.delta)}</td>
                <td className="px-4 py-3">{formatCurrency(account.totalDebits)}</td>
                <td className="px-4 py-3">{formatCurrency(account.totalCredits)}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold",
                      statusBadgeClass(account.status),
                    )}
                  >
                    {account.status.replaceAll("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
