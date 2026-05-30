"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { buildLoginUrl } from "@/lib/authSession";

export function useUnauthorizedRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(() => {
    router.replace(buildLoginUrl({ next: pathname, expired: true }));
  }, [pathname, router]);
}
