"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowLeftRight, FileText, Scale } from "lucide-react";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { StatementExportCard } from "@/components/accounts/StatementExportCard";
import { AccountIdentifiersSummary } from "@/components/shared/AccountIdentifiersSummary";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { StatusBadge, statusToTone } from "@/components/ui/StatusBadge";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/formatCurrency";
import { getShareAccountLabel } from "@/lib/institution";
import {
  RECENT_ACCOUNT_ACTIVITY_EMPTY_TITLE,
  RECENT_ACCOUNT_ACTIVITY_LOADING,
} from "@/lib/activityLabels";
import { MEMBER_ACCOUNTS_PATH, MEMBER_TRANSFERS_PATH } from "@/lib/memberRoutes";

function getStatusLabel(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function AccountDetailClient() {
  const params = useParams<{ accountId: string }>();
  const accountId = params.accountId;
  const { data: accountsData, error: accountsError, isLoading: accountsLoading, refetch } =
    useAccounts();
  const {
    data: transactionsData,
    error: transactionsError,
    isLoading: transactionsLoading,
  } = useTransactions({ accountId, limit: 12 });

  if (accountsLoading) {
    return <LoadingState title="Loading account" message="Retrieving account details." />;
  }

  if (accountsError) {
    return <ApiErrorState message={accountsError} onRetry={refetch} />;
  }

  const account = accountsData?.accounts.find((item) => item.id === accountId);

  if (!account) {
    return (
      <div className="grid gap-4">
        <EmptyState
          title="Account not found"
          message="This account is not linked to your membership or may have been closed."
        />
        <Link
          href={MEMBER_ACCOUNTS_PATH}
          className="inline-flex h-10 w-fit items-center gap-2 rounded-full border border-primary-navy/[0.10] px-4 text-sm font-semibold"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to accounts
        </Link>
      </div>
    );
  }

  const recentTransactions = transactionsData?.transactions.map((transaction) => ({
    id: transaction.id,
    accountId: transaction.accountId,
    accountType: transaction.accountType,
    maskedAccountNumber: transaction.maskedAccountNumber,
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
    merchant: transaction.merchant,
    reference: transaction.reference,
    status: transaction.status,
    createdAt: transaction.createdAt,
  }));

  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={MEMBER_ACCOUNTS_PATH}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-primary-navy/[0.10] bg-white px-4 text-sm font-semibold text-primary-navy transition hover:border-ocean-blue/[0.35] dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Accounts
        </Link>
      </div>

      <article className="overflow-hidden rounded-lg border border-primary-navy/[0.08] bg-white shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
        <div className="h-2 bg-gradient-to-r from-ocean-blue to-light-blue" />
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-bluewave-gray dark:text-white/[0.52]">
                {getShareAccountLabel(account.accountType)}
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-primary-navy dark:text-white">
                {account.displayName}
              </h1>
              <div className="mt-3">
                <StatusBadge label={getStatusLabel(account.status)} tone={statusToTone(account.status)} />
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs font-semibold uppercase text-bluewave-gray dark:text-white/[0.48]">
                Available balance
              </p>
              <p className="mt-1 text-3xl font-semibold text-primary-navy dark:text-white">
                {formatCurrency(account.availableBalance)}
              </p>
              <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                Current {formatCurrency(account.balance)}
              </p>
            </div>
          </div>

          <AccountIdentifiersSummary
            className="mt-6 rounded-lg bg-[#f7fbff] p-4 dark:bg-white/[0.05]"
            accountNumber={account.accountNumber}
            routingNumber={account.routingNumber}
            currency={account.currency}
          />

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={`${MEMBER_TRANSFERS_PATH}?from=${account.id}`}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-ocean-blue px-4 text-sm font-semibold text-primary-navy"
            >
              <ArrowLeftRight size={16} aria-hidden="true" />
              Transfer
            </Link>
            <Link
              href="/auth/statements"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-primary-navy/[0.10] px-4 text-sm font-semibold dark:border-white/[0.10]"
            >
              <FileText size={16} aria-hidden="true" />
              Statements
            </Link>
            <Link
              href="/auth/disputes"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-primary-navy/[0.10] px-4 text-sm font-semibold dark:border-white/[0.10]"
            >
              <Scale size={16} aria-hidden="true" />
              Dispute
            </Link>
          </div>
        </div>
      </article>

      {transactionsLoading ? (
        <LoadingState title="Loading transactions" message={RECENT_ACCOUNT_ACTIVITY_LOADING} />
      ) : transactionsError ? (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-700 dark:text-red-300">
          {transactionsError}
        </p>
      ) : recentTransactions && recentTransactions.length > 0 ? (
        <RecentTransactions
          transactions={recentTransactions}
          viewAllHref={`/auth/transactions?accountId=${account.id}`}
        />
      ) : (
        <EmptyState
          title={RECENT_ACCOUNT_ACTIVITY_EMPTY_TITLE}
          message="No transactions on this account yet."
        />
      )}

      <StatementExportCard />
    </section>
  );
}
