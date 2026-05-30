"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { cn } from "@/lib/utils";
import type { UserRole, UserStatus } from "@/types/banking";

const statusOptions: UserStatus[] = ["PENDING", "ACTIVE", "SUSPENDED"];
const roleOptions: UserRole[] = ["USER", "ADMIN"];

function getStatusLabel(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusBadgeClass(status: UserStatus) {
  if (status === "ACTIVE") {
    return "bg-ocean-blue/[0.10] text-royal-blue dark:text-light-blue";
  }

  if (status === "PENDING") {
    return "bg-amber-500/[0.12] text-amber-700 dark:text-amber-300";
  }

  return "bg-red-500/[0.12] text-red-700 dark:text-red-300";
}

export function AdminUsersClient() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: statusFilter || undefined,
      role: roleFilter || undefined,
    }),
    [search, statusFilter, roleFilter],
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

  if (isLoading) {
    return <LoadingState title="Loading users" message="Retrieving member and admin accounts." />;
  }

  if (error) {
    return (
      <ErrorState
        message={isForbidden ? "Admin access required. Sign in with a demo admin account." : error}
        onRetry={isForbidden ? undefined : refetch}
      />
    );
  }

  const users = data?.users ?? [];

  return (
    <section className="grid gap-5">
      <div className="grid gap-4 rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06] lg:grid-cols-3">
        <label className="block">
          <span className="text-sm font-semibold text-primary-navy dark:text-white">Search</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name or email"
            className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm outline-none focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-primary-navy dark:text-white">Status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as UserStatus | "")}
            className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm outline-none focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
          >
            <option value="">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-primary-navy dark:text-white">Role</span>
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as UserRole | "")}
            className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm outline-none focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
          >
            <option value="">All roles</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {getStatusLabel(role)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {updateError ? (
        <p className="rounded-lg border border-red-500/[0.20] bg-red-500/[0.08] px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
          {updateError}
        </p>
      ) : null}

      {users.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-primary-navy/[0.08] bg-white shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-primary-navy/[0.08] bg-[#f7fbff] dark:border-white/[0.08] dark:bg-white/[0.05]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Member</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-primary-navy/[0.06] dark:border-white/[0.06]">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-primary-navy dark:text-white">{user.fullName}</p>
                      <p className="mt-1 text-bluewave-gray dark:text-white/[0.58]">{user.email}</p>
                    </td>
                    <td className="px-4 py-4">{getStatusLabel(user.role)}</td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          getStatusBadgeClass(user.status),
                        )}
                      >
                        {getStatusLabel(user.status)}
                      </span>
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
                            Set {getStatusLabel(status)}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="No users found" message="Adjust filters or seed demo users." />
      )}
    </section>
  );
}
