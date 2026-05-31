"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminDetailDrawer } from "@/components/admin/AdminDetailDrawer";
import {
  AdminFilterBar,
  AdminFilterField,
  adminInputClassName,
} from "@/components/admin/AdminFilterBar";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatCurrency } from "@/lib/formatCurrency";
import { useAdminAccounts } from "@/hooks/useAdminAccounts";
import type { AccountStatus, AccountType, AdminAccountRecord } from "@/types/banking";

function formatStatusLabel(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function AdminAccountsClient() {
  const { data, error, isLoading, isForbidden, refetch } = useAdminAccounts();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AccountType | "">("");
  const [statusFilter, setStatusFilter] = useState<AccountStatus | "">("");
  const [selectedAccount, setSelectedAccount] = useState<AdminAccountRecord | null>(null);

  const accounts = useMemo(() => {
    const list = data?.accounts ?? [];
    const query = search.trim().toLowerCase();

    return list.filter((account) => {
      if (typeFilter && account.accountType !== typeFilter) {
        return false;
      }

      if (statusFilter && account.status !== statusFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        account.displayName.toLowerCase().includes(query) ||
        account.maskedAccountNumber.toLowerCase().includes(query) ||
        account.user.fullName.toLowerCase().includes(query) ||
        account.user.email.toLowerCase().includes(query)
      );
    });
  }, [data?.accounts, search, statusFilter, typeFilter]);

  if (isLoading) {
    return <LoadingState title="Loading accounts" message="Retrieving member account records." />;
  }

  if (error) {
    return (
      <ApiErrorState
        message={isForbidden ? "Administrator access required. Sign in with an authorized admin account." : error}
        onRetry={isForbidden ? undefined : refetch}
      />
    );
  }

  return (
    <section className="grid gap-4">
      <AdminFilterBar className="lg:grid-cols-3">
        <AdminFilterField label="Search">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={adminInputClassName}
          />
        </AdminFilterField>
        <AdminFilterField label="Account type">
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as AccountType | "")}
            className={adminInputClassName}
          >
            <option value="">All types</option>
            <option value="CHECKING">Checking</option>
            <option value="SAVINGS">Savings</option>
            <option value="CREDIT">Credit</option>
          </select>
        </AdminFilterField>
        <AdminFilterField label="Status">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as AccountStatus | "")}
            className={adminInputClassName}
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="FROZEN">Frozen</option>
            <option value="CLOSED">Closed</option>
          </select>
        </AdminFilterField>
      </AdminFilterBar>

      {accounts.length > 0 ? (
        accounts.map((account) => (
          <article
            key={account.id}
            className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <button type="button" onClick={() => setSelectedAccount(account)} className="text-left">
                <h2 className="text-lg font-semibold text-primary-navy hover:text-royal-blue dark:text-white">
                  {account.displayName}
                </h2>
                <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                  {account.maskedAccountNumber} | {account.user.fullName} ({account.user.email})
                </p>
              </button>
              <AdminStatusBadge status={account.status} />
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
                  {formatStatusLabel(account.user.status)}
                </p>
              </div>
            </div>
          </article>
        ))
      ) : (
        <EmptyState title="No accounts found" message="No accounts match your filters." />
      )}

      <AdminDetailDrawer
        open={Boolean(selectedAccount)}
        title={selectedAccount?.displayName ?? "Account detail"}
        subtitle={selectedAccount?.maskedAccountNumber}
        onClose={() => setSelectedAccount(null)}
      >
        {selectedAccount ? (
          <div className="space-y-4 text-sm">
            <div className="grid gap-3">
              <p>
                <span className="font-semibold">Member:</span> {selectedAccount.user.fullName}
              </p>
              <p>
                <span className="font-semibold">Type:</span> {formatStatusLabel(selectedAccount.accountType)}
              </p>
              <p>
                <span className="font-semibold">Balance:</span> {formatCurrency(selectedAccount.balance)}
              </p>
              <p>
                <span className="font-semibold">Available:</span>{" "}
                {formatCurrency(selectedAccount.availableBalance)}
              </p>
            </div>
            <p className="rounded-lg border border-amber-500/[0.30] bg-amber-500/[0.06] p-3 text-xs">
              Balances are ledger-controlled. Use Adjustments to post controlled corrections — never edit balances
              directly.
            </p>
            <Link
              href="/admin/adjustments"
              className="inline-block text-xs font-semibold text-royal-blue dark:text-light-blue"
            >
              Create adjustment
            </Link>
            <Link
              href="/admin/reconciliation"
              className="ml-4 inline-block text-xs font-semibold text-royal-blue dark:text-light-blue"
            >
              View reconciliation
            </Link>
          </div>
        ) : null}
      </AdminDetailDrawer>
    </section>
  );
}
