"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/data/mockBanking";
import { useAdminAccounts } from "@/hooks/useAdminAccounts";
import { cn } from "@/lib/utils";

function getStatusLabel(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function AdminAccountsClient() {
  const { data, error, isLoading, isForbidden, refetch } = useAdminAccounts();

  if (isLoading) {
    return <LoadingState title="Loading accounts" message="Retrieving member account records." />;
  }

  if (error) {
    return (
      <ErrorState
        message={isForbidden ? "Admin access required. Sign in with a demo admin account." : error}
        onRetry={isForbidden ? undefined : refetch}
      />
    );
  }

  const accounts = data?.accounts ?? [];

  return (
    <section className="grid gap-4">
      {accounts.length > 0 ? (
        accounts.map((account) => (
          <article
            key={account.id}
            className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
                  {account.displayName}
                </h2>
                <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                  {account.maskedAccountNumber} | {account.user.fullName} ({account.user.email})
                </p>
              </div>
              <span
                className={cn(
                  "w-fit rounded-full px-3 py-1 text-xs font-semibold",
                  account.status === "ACTIVE"
                    ? "bg-ocean-blue/[0.10] text-royal-blue dark:text-light-blue"
                    : "bg-primary-navy/[0.06] text-primary-navy dark:bg-white/[0.08] dark:text-white",
                )}
              >
                {getStatusLabel(account.status)}
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-[#f7fbff] p-4 dark:bg-white/[0.05]">
                <p className="text-xs uppercase text-bluewave-gray dark:text-white/[0.48]">Balance</p>
                <p className="mt-2 font-semibold text-primary-navy dark:text-white">
                  {formatCurrency(account.balance)}
                </p>
              </div>
              <div className="rounded-lg bg-[#f7fbff] p-4 dark:bg-white/[0.05]">
                <p className="text-xs uppercase text-bluewave-gray dark:text-white/[0.48]">Available</p>
                <p className="mt-2 font-semibold text-primary-navy dark:text-white">
                  {formatCurrency(account.availableBalance)}
                </p>
              </div>
              <div className="rounded-lg bg-[#f7fbff] p-4 dark:bg-white/[0.05]">
                <p className="text-xs uppercase text-bluewave-gray dark:text-white/[0.48]">Member status</p>
                <p className="mt-2 font-semibold text-primary-navy dark:text-white">
                  {getStatusLabel(account.user.status)}
                </p>
              </div>
            </div>
          </article>
        ))
      ) : (
        <EmptyState title="No accounts found" message="Seed demo accounts to review admin account data." />
      )}
    </section>
  );
}
