"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { NotificationsPanel } from "@/components/notifications/NotificationsPanel";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data } = useNotifications(8);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-full border border-primary-navy/[0.08] bg-white text-primary-navy shadow-[0_12px_34px_rgba(10,42,94,0.07)] transition hover:text-ocean-blue dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-white",
          open && "border-ocean-blue/[0.40] text-ocean-blue",
        )}
      >
        <Bell size={19} aria-hidden="true" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ocean-blue px-1 text-[10px] font-bold text-primary-navy">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-3 w-[min(92vw,360px)]">
          <NotificationsPanel compact limit={8} />
        </div>
      ) : null}
    </div>
  );
}
