"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useAdminOperationalAlerts } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

type AdminNotificationsBellProps = {
  grouped?: boolean;
};

export function AdminNotificationsBell({ grouped = false }: AdminNotificationsBellProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { alerts, isLoading } = useAdminOperationalAlerts();

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

  const alertCount = alerts.length;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Operational alerts"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center text-primary-navy transition hover:text-ocean-blue dark:text-white",
          grouped
            ? "rounded-none border-0 bg-transparent shadow-none"
            : "rounded-full border border-primary-navy/[0.08] bg-white shadow-[0_12px_34px_rgba(10,42,94,0.07)] dark:border-white/[0.08] dark:bg-white/[0.06]",
          open && (grouped ? "text-ocean-blue" : "border-ocean-blue/[0.40] text-ocean-blue"),
        )}
      >
        <Bell size={19} aria-hidden="true" />
        {alertCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ocean-blue px-1 text-[10px] font-bold text-primary-navy">
            {alertCount > 9 ? "9+" : alertCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-3 w-[min(92vw,360px)] overflow-hidden rounded-xl border border-primary-navy/[0.08] bg-white shadow-[0_24px_70px_rgba(10,42,94,0.16)] dark:border-white/[0.08] dark:bg-[#071526]">
          <div className="border-b border-primary-navy/[0.06] px-4 py-3 dark:border-white/[0.06]">
            <p className="text-sm font-semibold text-primary-navy dark:text-white">Operational alerts</p>
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {isLoading ? (
              <p className="px-2 py-3 text-sm text-bluewave-gray dark:text-white/[0.58]">Loading alerts...</p>
            ) : alerts.length > 0 ? (
              alerts.map((alert) => (
                <Link
                  key={alert.id}
                  href={alert.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 transition hover:bg-primary-navy/[0.05] dark:hover:bg-white/[0.06]"
                >
                  <p className="text-sm font-semibold text-primary-navy dark:text-white">{alert.title}</p>
                  <p className="mt-1 text-xs leading-5 text-bluewave-gray dark:text-white/[0.58]">
                    {alert.message}
                  </p>
                </Link>
              ))
            ) : (
              <p className="px-2 py-3 text-sm text-bluewave-gray dark:text-white/[0.58]">
                No operational alerts right now.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
