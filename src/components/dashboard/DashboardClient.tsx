"use client";

import { CircleHelp, RefreshCw, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AccountActivityTimeline } from "@/components/accounts/AccountActivityTimeline";
import { StatementExportCard } from "@/components/accounts/StatementExportCard";
import { AccountOverview } from "@/components/dashboard/AccountOverview";
import { BalanceCards } from "@/components/dashboard/BalanceCards";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { SecuritySessionCard } from "@/components/dashboard/SecuritySessionCard";
import { notifyProfilePhotoUpdated } from "@/components/profile/ProfilePhotoUpload";
import { ProfilePhotoAvatar } from "@/components/shared/ProfilePhotoAvatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  formatMembershipStatusLabel,
  membershipStatusTone,
} from "@/lib/membershipStatus";
import { withPhotoCacheBuster } from "@/lib/memberAvatar";
import { useDashboardData } from "@/hooks/useDashboardData";

const skeletonCards = ["balance", "savings", "card"];

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <LoadingState
        title="Loading dashboard"
        message="Retrieving your accounts, cards, transactions, and member services."
      />
      <section className="grid gap-4 lg:grid-cols-3">
        {skeletonCards.map((item) => (
          <div
            key={item}
            className="h-56 animate-pulse rounded-lg border border-primary-navy/[0.08] bg-white shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
          >
            <div className="h-2 rounded-t-lg bg-ocean-blue/[0.28]" />
            <div className="space-y-5 p-5">
              <div className="h-4 w-24 rounded-full bg-primary-navy/[0.08] dark:bg-white/[0.10]" />
              <div className="h-5 w-44 rounded-full bg-primary-navy/[0.10] dark:bg-white/[0.14]" />
              <div className="h-9 w-32 rounded-full bg-primary-navy/[0.10] dark:bg-white/[0.14]" />
              <div className="h-4 w-full rounded-full bg-primary-navy/[0.08] dark:bg-white/[0.10]" />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export function DashboardClient() {
  const { data, error, isLoading, refetch } = useDashboardData();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  async function handlePhotoUpload(file: File) {
    setIsUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch("/api/profile/photo", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const payload = (await response.json()) as {
        success: boolean;
        data?: { profilePhotoUrl: string | null };
      };

      if (!payload.success || !payload.data) {
        return false;
      }

      const profilePhotoUrl = withPhotoCacheBuster(
        payload.data.profilePhotoUrl,
        String(Date.now()),
      );
      notifyProfilePhotoUpdated(profilePhotoUrl);
      await refetch();
      return true;
    } catch {
      return false;
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <ApiErrorState
        title="Dashboard unavailable"
        message={error}
        actionLabel="Reload Dashboard"
        onRetry={refetch}
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="No dashboard data"
        message="Sign in to access your accounts, transfers, and member services."
      />
    );
  }

  const totalAvailable = data.accounts.reduce(
    (sum, account) => sum + account.availableBalance,
    0,
  );

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <ProfilePhotoAvatar
              fullName={data.user.fullName}
              profilePhotoUrl={data.user.profilePhotoUrl}
              onUpload={handlePhotoUpload}
              isUploading={isUploadingPhoto}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-primary-navy dark:text-white sm:text-2xl">
                  Welcome back, {data.user.firstName}
                </h2>
                <StatusBadge
                  label={`Account status: ${formatMembershipStatusLabel(data.user.status)}`}
                  tone={membershipStatusTone(data.user.status)}
                />
              </div>
              <p className="mt-3 text-sm font-semibold text-primary-navy dark:text-white sm:mt-4 sm:text-base">
                Available Balance
              </p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-royal-blue dark:text-light-blue sm:text-4xl">
                {formatCurrency(totalAvailable)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={refetch}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary-navy/[0.10] bg-[#f7fbff] text-primary-navy transition hover:border-ocean-blue/[0.40] hover:text-royal-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            aria-label="Refresh dashboard"
          >
            <RefreshCw size={16} aria-hidden="true" />
          </button>
        </div>
      </section>

      {data.accounts.length > 0 ? (
        <BalanceCards accounts={data.accounts} />
      ) : (
        <EmptyState
          title="No accounts found"
          message="No account balances are available yet. Contact member services if you recently opened membership."
        />
      )}

      {data.kycSummary.needsProfileCompletion ? (
        <section className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-5 dark:border-amber-400/30 dark:bg-amber-500/10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-200">
                <UserRound size={21} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
                  Complete your profile
                </h2>
                <p className="mt-1 text-sm leading-6 text-bluewave-gray dark:text-white/[0.62]">
                  Your KYC status is {data.kycSummary.kycStatus.replaceAll("_", " ").toLowerCase()}.
                  Complete and submit your profile to reduce transfer and bill pay risk flags.
                </p>
              </div>
            </div>
            <Link
              href="/auth/profile"
              className="inline-flex h-11 items-center justify-center rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy"
            >
              Go to profile
            </Link>
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
          <div className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              <ShieldCheck size={21} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
                KYC status: {data.kycSummary.kycStatus.replaceAll("_", " ")}
              </h2>
              <p className="mt-1 text-sm leading-6 text-bluewave-gray dark:text-white/[0.62]">
                {data.kycSummary.kycStatus === "VERIFIED"
                  ? "Your identity verification is complete."
                  : "Your profile is being verified by member services."}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <QuickActions />
        <RecentTransactions transactions={data.recentTransactions} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <AccountOverview accounts={data.accounts} loans={data.loans} />
        <div className="grid gap-5">
          <SecuritySessionCard />

          <div className="rounded-lg border border-primary-navy/[0.08] bg-primary-navy p-5 text-white shadow-[0_18px_60px_rgba(10,42,94,0.12)]">
            <div className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-light-blue/[0.16] text-light-blue">
                <CircleHelp size={21} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Support summary</h2>
                <p className="mt-3 text-sm leading-6 text-white/[0.68]">
                  {data.supportTicketSummary.open} open and{" "}
                  {data.supportTicketSummary.pending} pending support tickets from{" "}
                  {data.supportTicketSummary.total} total support requests on file.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <AccountActivityTimeline limit={8} />
        <StatementExportCard />
      </section>
    </div>
  );
}
