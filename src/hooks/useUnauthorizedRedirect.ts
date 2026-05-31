"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { buildAdminAuthUrl, buildMemberAuthUrl, isAdminPath } from "@/lib/authRoutes";

export function useUnauthorizedRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(() => {
    const loginUrl = isAdminPath(pathname)
      ? buildAdminAuthUrl({ next: pathname, expired: true })
      : buildMemberAuthUrl({ next: pathname, expired: true });

    router.replace(loginUrl);
  }, [pathname, router]);
}
