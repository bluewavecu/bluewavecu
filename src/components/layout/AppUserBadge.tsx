"use client";

import { ChevronDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PROFILE_PHOTO_UPDATED_EVENT } from "@/components/profile/ProfilePhotoUpload";
import { MemberAvatar } from "@/components/shared/MemberAvatar";
import { useTranslation } from "@/i18n/LocaleProvider";
import { buildAdminAuthUrl, buildMemberAuthUrl } from "@/lib/authRoutes";
import { getJson, postJson } from "@/lib/clientApi";
import { cn } from "@/lib/utils";
import type { SafeUser } from "@/types/banking";

type HeaderUser = Pick<SafeUser, "fullName" | "email" | "role">;

type MeResponse = {
  user: HeaderUser;
  profilePhotoUrl: string | null;
};

type AppUserBadgeProps = {
  showLogout?: boolean;
  grouped?: boolean;
};

export function AppUserBadge({ showLogout = true, grouped = false }: AppUserBadgeProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      const result = await getJson<MeResponse>("/api/auth/me");

      if (!cancelled && result.success) {
        setUser(result.data.user);
        setProfilePhotoUrl(result.data.profilePhotoUrl);
      }
    }

    void loadCurrentUser();

    function handlePhotoUpdated(event: Event) {
      const detail = (event as CustomEvent<{ profilePhotoUrl: string | null }>).detail;
      setProfilePhotoUrl(detail.profilePhotoUrl);
    }

    window.addEventListener(PROFILE_PHOTO_UPDATED_EVENT, handlePhotoUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener(PROFILE_PHOTO_UPDATED_EVENT, handlePhotoUpdated);
    };
  }, []);

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

  async function handleLogout() {
    setIsSigningOut(true);

    const role = user?.role;

    await postJson("/api/auth/logout", {});
    setUser(null);
    setOpen(false);
    router.push(role === "ADMIN" ? buildAdminAuthUrl() : buildMemberAuthUrl());
    router.refresh();
  }

  const displayName = user?.fullName ?? t("common.member");
  const displayMeta = user?.email ?? t("common.signedIn");

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "inline-flex h-10 max-w-[12rem] items-center gap-2 py-1 pl-1 pr-2.5 transition",
          grouped
            ? "rounded-none border-0 bg-transparent shadow-none hover:bg-primary-navy/[0.04] dark:hover:bg-white/[0.06]"
            : "rounded-full border border-primary-navy/[0.08] bg-white shadow-[0_12px_34px_rgba(10,42,94,0.07)] hover:border-ocean-blue/[0.35] dark:border-white/[0.08] dark:bg-white/[0.06]",
          open && !grouped && "border-ocean-blue/[0.35]",
          open && grouped && "bg-primary-navy/[0.04] dark:bg-white/[0.06]",
        )}
      >
        <MemberAvatar fullName={displayName} profilePhotoUrl={profilePhotoUrl} size="sm" />
        <span className="hidden truncate text-sm font-semibold text-primary-navy dark:text-white md:inline">
          {displayName.split(" ")[0]}
        </span>
        <ChevronDown
          size={15}
          aria-hidden="true"
          className={cn(
            "shrink-0 text-bluewave-gray transition dark:text-white/[0.52]",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-primary-navy/[0.08] bg-white p-2 shadow-[0_24px_70px_rgba(10,42,94,0.16)] dark:border-white/[0.08] dark:bg-[#071526]"
        >
          <div className="border-b border-primary-navy/[0.06] px-3 py-2.5 dark:border-white/[0.06]">
            <p className="truncate text-sm font-semibold text-primary-navy dark:text-white">
              {displayName}
            </p>
            <p className="truncate text-xs text-bluewave-gray dark:text-white/[0.52]">{displayMeta}</p>
          </div>

          {showLogout && user ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => void handleLogout()}
              disabled={isSigningOut}
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-primary-navy transition hover:bg-primary-navy/[0.05] disabled:opacity-60 dark:text-white dark:hover:bg-white/[0.06]"
            >
              <LogOut size={16} aria-hidden="true" />
              {isSigningOut ? t("common.signingOut") : t("common.signOut")}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
