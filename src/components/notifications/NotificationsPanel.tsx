"use client";

import { Bell, CheckCheck } from "lucide-react";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

type NotificationsPanelProps = {
  className?: string;
  limit?: number;
  compact?: boolean;
};

export function NotificationsPanel({
  className,
  limit = 5,
  compact = false,
}: NotificationsPanelProps) {
  const { data, error, isLoading, markRead, markAllRead } = useNotifications(limit);

  return (
    <div
      className={cn(
        "rounded-lg border border-primary-navy/[0.08] bg-white shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-primary-navy/[0.08] px-4 py-3 dark:border-white/[0.08]">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-ocean-blue" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-primary-navy dark:text-white">
            Notifications
          </h2>
          {data && data.unreadCount > 0 ? (
            <span className="rounded-full bg-ocean-blue px-2 py-0.5 text-xs font-semibold text-primary-navy">
              {data.unreadCount}
            </span>
          ) : null}
        </div>
        {data && data.unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="inline-flex items-center gap-1 text-xs font-semibold text-royal-blue hover:text-ocean-blue dark:text-light-blue"
          >
            <CheckCheck size={14} aria-hidden="true" />
            Mark all read
          </button>
        ) : null}
      </div>

      <div className={cn("grid gap-3 p-4", compact ? "max-h-80 overflow-y-auto" : "")}>
        {isLoading ? (
          <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">Loading notifications...</p>
        ) : error ? (
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        ) : data && data.notifications.length > 0 ? (
          data.notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={(id) => void markRead(id)}
            />
          ))
        ) : (
          <p className="text-sm text-bluewave-gray dark:text-white/[0.58]">
            You&apos;re all caught up. New banking alerts will appear here.
          </p>
        )}
      </div>
    </div>
  );
}
