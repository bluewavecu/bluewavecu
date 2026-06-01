"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { buildMemberAuthUrl } from "@/lib/authRoutes";
import { postJson } from "@/lib/clientApi";

export function useMemberLogout() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = useCallback(async () => {
    setIsSigningOut(true);
    await postJson("/api/auth/logout", {});
    router.push(buildMemberAuthUrl());
    router.refresh();
    setIsSigningOut(false);
  }, [router]);

  return { signOut, isSigningOut };
}
