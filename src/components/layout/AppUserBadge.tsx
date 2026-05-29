"use client";

import { useEffect, useState } from "react";
import { userProfile } from "@/data/mockBanking";
import { getJson } from "@/lib/clientApi";
import type { SafeUser } from "@/types/banking";

type HeaderUser = Pick<SafeUser, "fullName" | "email">;

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

export function AppUserBadge() {
  const [user, setUser] = useState<HeaderUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      const result = await getJson<MeResponse>("/api/auth/me");

      if (!cancelled && result.success) {
        setUser(result.data.user);
      }
    }

    loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = user?.fullName ?? userProfile.name;
  const displayMeta = user?.email ?? userProfile.membershipId;
  const initials = getInitials(displayName);

  return (
    <div className="flex items-center gap-3 rounded-full border border-primary-navy/[0.08] bg-white py-1 pl-1 pr-4 shadow-[0_12px_34px_rgba(10,42,94,0.07)] dark:border-white/[0.08] dark:bg-white/[0.06]">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-navy text-sm font-semibold text-white">
        {initials || userProfile.avatarInitials}
      </span>
      <div className="hidden sm:block">
        <p className="text-sm font-semibold text-primary-navy dark:text-white">{displayName}</p>
        <p className="max-w-44 truncate text-xs text-bluewave-gray dark:text-white/[0.52]">
          {displayMeta}
        </p>
      </div>
    </div>
  );
}
