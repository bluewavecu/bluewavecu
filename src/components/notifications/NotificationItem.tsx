"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { NotificationRecord } from "@/types/banking";

type NotificationItemProps = {
  notification: NotificationRecord;
  onMarkRead?: (notificationId: string) => void;
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getHref(notification: NotificationRecord) {
  const href = notification.metadata?.href;

  return typeof href === "string" ? href : null;
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const href = getHref(notification);
  const content = (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 transition",
        notification.isRead
          ? "border-primary-navy/[0.06] bg-[#f7fbff] dark:border-white/[0.06] dark:bg-white/[0.04]"
          : "border-ocean-blue/[0.20] bg-ocean-blue/[0.06]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary-navy dark:text-white">
            {notification.title}
          </p>
          <p className="mt-1 text-sm leading-6 text-bluewave-gray dark:text-white/[0.62]">
            {notification.message}
          </p>
          <p className="mt-2 text-xs text-bluewave-gray dark:text-white/[0.48]">
            {formatTime(notification.createdAt)}
          </p>
        </div>
        {!notification.isRead && onMarkRead ? (
          <button
            type="button"
            onClick={() => onMarkRead(notification.id)}
            className="shrink-0 text-xs font-semibold text-royal-blue hover:text-ocean-blue dark:text-light-blue"
          >
            Mark read
          </button>
        ) : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={() => onMarkRead?.(notification.id)} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
