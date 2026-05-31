"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { buildAdminAuthUrl, buildMemberAuthUrl } from "@/lib/authRoutes";
import {
  SESSION_HEARTBEAT_INTERVAL_MS,
  SESSION_INACTIVITY_TIMEOUT_MS,
} from "@/lib/sessionPolicy";

type InactivityLogoutGuardProps = {
  portal: "member" | "admin";
};

const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"] as const;

export function InactivityLogoutGuard({ portal }: InactivityLogoutGuardProps) {
  const router = useRouter();
  const lastActivityRef = useRef(0);
  const logoutTimerRef = useRef<number | null>(null);
  const heartbeatTimerRef = useRef<number | null>(null);
  const signingOutRef = useRef(false);

  useEffect(() => {
    async function signOutDueToInactivity() {
      if (signingOutRef.current) {
        return;
      }

      signingOutRef.current = true;

      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        });
      } catch {
        // Continue to login even if logout request fails.
      }

      const loginUrl =
        portal === "admin"
          ? buildAdminAuthUrl({ expired: true })
          : buildMemberAuthUrl({ expired: true });

      router.replace(loginUrl);
      router.refresh();
    }

    function scheduleLogoutTimer() {
      if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current);
      }

      const remaining = SESSION_INACTIVITY_TIMEOUT_MS - (Date.now() - lastActivityRef.current);
      logoutTimerRef.current = window.setTimeout(
        () => {
          void signOutDueToInactivity();
        },
        Math.max(remaining, 0),
      );
    }

    async function sendHeartbeat() {
      if (signingOutRef.current) {
        return;
      }

      if (Date.now() - lastActivityRef.current > SESSION_INACTIVITY_TIMEOUT_MS) {
        void signOutDueToInactivity();
        return;
      }

      try {
        const response = await fetch("/api/auth/session/heartbeat", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        });

        if (response.status === 401) {
          void signOutDueToInactivity();
        }
      } catch {
        // Ignore transient network errors; the idle timer still applies.
      }
    }

    function recordActivity() {
      lastActivityRef.current = Date.now();
      scheduleLogoutTimer();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        recordActivity();
        void sendHeartbeat();
      }
    }

    recordActivity();
    void sendHeartbeat();

    heartbeatTimerRef.current = window.setInterval(() => {
      void sendHeartbeat();
    }, SESSION_HEARTBEAT_INTERVAL_MS);

    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, recordActivity, { passive: true });
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current);
      }

      if (heartbeatTimerRef.current) {
        window.clearInterval(heartbeatTimerRef.current);
      }

      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, recordActivity);
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [portal, router]);

  return null;
}
