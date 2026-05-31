"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { InfoPanel } from "@/components/ui/InfoPanel";
import type { SafeUser } from "@/types/banking";

export function AccountReadOnlyBanner() {
  const [user, setUser] = useState<SafeUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });
        const payload = (await response.json()) as {
          success: boolean;
          data?: { user: SafeUser };
        };

        if (!cancelled && payload.success && payload.data) {
          setUser(payload.data.user);
        }
      } catch {
        // Ignore banner fetch failures.
      }
    }

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!user || user.status !== "SUSPENDED") {
    return null;
  }

  return (
    <InfoPanel title="Account suspended — view only" variant="warning" className="mb-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
        <div>
          <p>
            You can sign in to review balances, transactions, and statements. Transfers, bill pay,
            and other account changes are unavailable until member services reactivates your account.
          </p>
          {user.statusNote ? (
            <p className="mt-2 text-sm opacity-90">Note from member services: {user.statusNote}</p>
          ) : null}
        </div>
      </div>
    </InfoPanel>
  );
}
