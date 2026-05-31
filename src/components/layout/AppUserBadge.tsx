"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { buildAdminAuthUrl, buildMemberAuthUrl } from "@/lib/authRoutes";
import { getJson, postJson } from "@/lib/clientApi";
import type { SafeUser } from "@/types/banking";

type HeaderUser = Pick<SafeUser, "fullName" | "email" | "role">;

type MeResponse = {
  user: HeaderUser;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

type AppUserBadgeProps = {
  showLogout?: boolean;
};

export function AppUserBadge({ showLogout = true }: AppUserBadgeProps) {
  const router = useRouter();
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      const result = await getJson<MeResponse>("/api/auth/me");

      if (!cancelled && result.success) {
        setUser(result.data.user);
      }
    }

    void loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    setIsSigningOut(true);

    const role = user?.role;

    await postJson("/api/auth/logout", {});
    setUser(null);
    router.push(role === "ADMIN" ? buildAdminAuthUrl() : buildMemberAuthUrl());
    router.refresh();
  }

  const displayName = user?.fullName ?? "Member session";
  const displayMeta = user?.email ?? "Sign in required";
  const initials = getInitials(displayName);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-3 rounded-full border border-primary-navy/[0.08] bg-white py-1 pl-1 pr-4 shadow-[0_12px_34px_rgba(10,42,94,0.07)] dark:border-white/[0.08] dark:bg-white/[0.06]">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-navy text-sm font-semibold text-white">
          {initials || "BW"}
        </span>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-primary-navy dark:text-white">{displayName}</p>
          <p className="max-w-44 truncate text-xs text-bluewave-gray dark:text-white/[0.52]">
            {displayMeta}
          </p>
        </div>
      </div>

      {showLogout && user ? (
        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={isSigningOut}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-primary-navy/[0.08] bg-white px-3 text-xs font-semibold text-primary-navy transition hover:border-ocean-blue hover:text-ocean-blue disabled:opacity-60 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-white"
        >
          <LogOut size={15} aria-hidden="true" />
          {isSigningOut ? "Signing out..." : "Sign out"}
        </button>
      ) : null}
    </div>
  );
}
