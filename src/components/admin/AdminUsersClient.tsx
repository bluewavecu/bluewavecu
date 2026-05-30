"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
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
import { formatCurrency } from "@/data/mockBanking";
import { useAdminMemberDetail } from "@/hooks/useAdminMemberDetail";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import type { KycStatus, UserRole, UserStatus } from "@/types/banking";

const statusOptions: UserStatus[] = ["PENDING", "ACTIVE", "SUSPENDED"];
const roleOptions: UserRole[] = ["USER", "ADMIN"];
const kycOptions: KycStatus[] = [
  "NOT_STARTED",
  "SUBMITTED",
  "UNDER_REVIEW",
  "VERIFIED",
  "REJECTED",
];

function formatStatusLabel(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function AdminUsersClient() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [kycFilter, setKycFilter] = useState<KycStatus | "">("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: statusFilter || undefined,
      role: roleFilter || undefined,
      kycStatus: kycFilter || undefined,
    }),
    [search, statusFilter, roleFilter, kycFilter],
  );

  const {
    data,
    error,
    isLoading,
    isForbidden,
    isUpdating,
    updateError,
    refetch,
    updateUserStatus,
  } = useAdminUsers(filters);

  const {
    data: memberDetail,
    isLoading: detailLoading,
    error: detailError,
  } = useAdminMemberDetail(selectedUserId);

  if (isLoading) {
    return <LoadingState title="Loading users" message="Retrieving member and admin accounts." />;
  }

  if (error) {
    return (
      <ApiErrorState
        message={isForbidden ? "Admin access required. Sign in with a demo admin account." : error}
        onRetry={isForbidden ? undefined : refetch}
      />
    );
  }

  const users = data?.users ?? [];

  return (
    <section className="grid gap-5">
      <AdminFilterBar className="lg:grid-cols-4">
        <AdminFilterField label="Search">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={adminInputClassName}
          />
        </AdminFilterField>
        <AdminFilterField label="Status">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as UserStatus | "")}
            className={adminInputClassName}
          >
            <option value="">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {formatStatusLabel(status)}
              </option>
            ))}
          </select>
        </AdminFilterField>
        <AdminFilterField label="Role">
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as UserRole | "")}
            className={adminInputClassName}
          >
            <option value="">All roles</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {formatStatusLabel(role)}
              </option>
            ))}
          </select>
        </AdminFilterField>
        <AdminFilterField label="KYC status">
          <select
            value={kycFilter}
            onChange={(event) => setKycFilter(event.target.value as KycStatus | "")}
            className={adminInputClassName}
          >
            <option value="">All KYC statuses</option>
            {kycOptions.map((status) => (
              <option key={status} value={status}>
                {formatStatusLabel(status)}
              </option>
            ))}
          </select>
        </AdminFilterField>
      </AdminFilterBar>

      {updateError ? (
        <p className="rounded-lg border border-red-500/[0.20] bg-red-500/[0.08] px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
          {updateError}
        </p>
      ) : null}

      {users.length > 0 ? (
        <AdminDataTable columns={["Member", "Role", "Status", "KYC", "Actions"]}>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-primary-navy/[0.06] dark:border-white/[0.06]">
              <td className="px-4 py-4">
                <button
                  type="button"
                  onClick={() => setSelectedUserId(user.id)}
                  className="text-left"
                >
                  <p className="font-semibold text-primary-navy hover:text-royal-blue dark:text-white">
                    {user.fullName}
                  </p>
                  <p className="mt-1 text-bluewave-gray dark:text-white/[0.58]">{user.email}</p>
                </button>
              </td>
              <td className="px-4 py-4">
                <AdminStatusBadge status={user.role} />
              </td>
              <td className="px-4 py-4">
                <AdminStatusBadge status={user.status} />
              </td>
              <td className="px-4 py-4">
                {user.kycStatus ? (
                  <AdminStatusBadge status={user.kycStatus} />
                ) : (
                  <span className="text-sm text-bluewave-gray">—</span>
                )}
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <button
                      key={`${user.id}-${status}`}
                      type="button"
                      disabled={isUpdating || user.status === status}
                      onClick={() => void updateUserStatus(user.id, status)}
                      className="rounded-full border border-primary-navy/[0.08] px-3 py-1.5 text-xs font-semibold transition hover:border-ocean-blue disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.08]"
                    >
                      {formatStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </AdminDataTable>
      ) : (
        <EmptyState title="No users found" message="Adjust filters or seed demo users." />
      )}

      <AdminDetailDrawer
        open={Boolean(selectedUserId)}
        title={memberDetail?.user.fullName ?? "Member detail"}
        subtitle={memberDetail?.user.email}
        onClose={() => setSelectedUserId(null)}
      >
        {detailLoading ? (
          <p className="text-sm text-bluewave-gray">Loading member profile...</p>
        ) : detailError ? (
          <p className="text-sm text-red-700">{detailError}</p>
        ) : memberDetail ? (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <AdminStatusBadge status={memberDetail.user.status} />
              <AdminStatusBadge status={memberDetail.user.role} />
              {memberDetail.user.kycStatus ? (
                <AdminStatusBadge status={memberDetail.user.kycStatus} />
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-[#f7fbff] p-3 dark:bg-white/[0.05]">
                <p className="text-xs uppercase text-bluewave-gray">Accounts</p>
                <p className="mt-1 font-semibold">{memberDetail.accounts.length}</p>
              </div>
              <div className="rounded-lg bg-[#f7fbff] p-3 dark:bg-white/[0.05]">
                <p className="text-xs uppercase text-bluewave-gray">Active sessions</p>
                <p className="mt-1 font-semibold">{memberDetail.activeSessionCount}</p>
              </div>
              <div className="rounded-lg bg-[#f7fbff] p-3 dark:bg-white/[0.05]">
                <p className="text-xs uppercase text-bluewave-gray">Open tickets</p>
                <p className="mt-1 font-semibold">{memberDetail.openTicketCount}</p>
              </div>
              <div className="rounded-lg bg-[#f7fbff] p-3 dark:bg-white/[0.05]">
                <p className="text-xs uppercase text-bluewave-gray">Open disputes</p>
                <p className="mt-1 font-semibold">{memberDetail.openDisputeCount}</p>
              </div>
            </div>

            {memberDetail.accounts.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-primary-navy dark:text-white">Linked accounts</h3>
                <ul className="mt-2 space-y-2">
                  {memberDetail.accounts.map((account) => (
                    <li
                      key={account.id}
                      className="rounded-lg border border-primary-navy/[0.08] p-3 text-sm dark:border-white/[0.08]"
                    >
                      <p className="font-medium">{account.displayName}</p>
                      <p className="text-bluewave-gray">{account.maskedAccountNumber}</p>
                      <p className="mt-1 font-semibold">{formatCurrency(account.balance)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {memberDetail.recentTransactions.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-primary-navy dark:text-white">Recent transactions</h3>
                <ul className="mt-2 space-y-2">
                  {memberDetail.recentTransactions.slice(0, 5).map((tx) => (
                    <li key={tx.id} className="text-sm">
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-bluewave-gray">
                        {formatCurrency(Math.abs(tx.amount))} | {formatStatusLabel(tx.status)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {memberDetail.recentEvents.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-primary-navy dark:text-white">Recent events</h3>
                <ul className="mt-2 space-y-2">
                  {memberDetail.recentEvents.slice(0, 5).map((event) => (
                    <li key={event.id} className="text-sm text-bluewave-gray">
                      {event.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/compliance"
                className="text-xs font-semibold text-royal-blue dark:text-light-blue"
              >
                Review KYC
              </Link>
              <Link
                href="/admin/sessions"
                className="text-xs font-semibold text-royal-blue dark:text-light-blue"
              >
                View sessions
              </Link>
            </div>
          </div>
        ) : null}
      </AdminDetailDrawer>
    </section>
  );
}
