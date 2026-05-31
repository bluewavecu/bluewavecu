"use client";

import Link from "next/link";
import { useState } from "react";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiErrorState } from "@/components/ui/ApiErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  formatNotificationTypeLabel,
  StatusBadge,
  statusToTone,
} from "@/components/ui/StatusBadge";
import { useNotifications } from "@/hooks/useNotifications";
import type { NotificationType } from "@/types/banking";
import { cn } from "@/lib/utils";

type ReadFilter = "all" | "unread" | "read";

function notificationLink(type: NotificationType) {
  if (type === "TRANSFER") return "/transfers";
  if (type === "SUPPORT") return "/member/support";
  if (type === "SECURITY") return "/member/security";
  if (type === "ACCOUNT") return "/accounts";
  return "/dashboard";
}

export function NotificationsClient() {
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const limit = readFilter === "all" ? 50 : 50;
  const { data, error, isLoading, refetch, markRead, markAllRead } = useNotifications(limit);

  const notifications =
    readFilter === "all"
      ? (data?.notifications ?? [])
      : (data?.notifications ?? []).filter((n) =>
          readFilter === "unread" ? !n.isRead : n.isRead,
        );

  if (isLoading) {
    return <LoadingState title="Loading notifications" message="Retrieving your alerts." />;
  }

  if (error) {
    return <ApiErrorState message={error} onRetry={refetch} />;
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
            Notifications
          </h2>
          <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
            {data?.unreadCount ?? 0} unread
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "unread", "read"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setReadFilter(filter)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold capitalize transition",
                readFilter === filter
                  ? "bg-ocean-blue text-primary-navy"
                  : "border border-primary-navy/[0.10] bg-white text-primary-navy dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white",
              )}
            >
              {filter}
            </button>
          ))}
          {(data?.unreadCount ?? 0) > 0 ? (
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="rounded-full border border-primary-navy/[0.10] px-4 py-2 text-sm font-semibold text-primary-navy dark:border-white/[0.10] dark:text-white"
            >
              Mark all read
            </button>
          ) : null}
        </div>
      </div>

      {notifications.length > 0 ? (
        <div className="divide-y divide-primary-navy/[0.08] rounded-lg border border-primary-navy/[0.08] bg-white dark:divide-white/[0.08] dark:border-white/[0.08] dark:bg-white/[0.06]">
          {notifications.map((notification) => (
            <div key={notification.id} className="p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <StatusBadge
                  label={formatNotificationTypeLabel(notification.type)}
                  tone={statusToTone(notification.type)}
                />
                <Link
                  href={notificationLink(notification.type)}
                  className="text-xs font-semibold text-royal-blue dark:text-light-blue"
                >
                  View related
                </Link>
              </div>
              <NotificationItem
                notification={notification}
                onMarkRead={() => void markRead(notification.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No notifications" message="You're all caught up." />
      )}
    </section>
  );
}
