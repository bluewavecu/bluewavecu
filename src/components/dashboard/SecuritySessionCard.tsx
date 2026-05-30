"use client";

import Link from "next/link";
import { Shield, Smartphone } from "lucide-react";
import { InfoPanel } from "@/components/ui/InfoPanel";
import { LoadingState } from "@/components/ui/LoadingState";
import { useMemberSummary } from "@/hooks/useMemberSummary";
import { MEMBER_SECURITY_PATH } from "@/lib/memberRoutes";

export function SecuritySessionCard() {
  const { summary, isLoading } = useMemberSummary();

  if (isLoading) {
    return (
      <LoadingState title="Loading security" message="Retrieving session summary." />
    );
  }

  const sessionCount = summary?.activeSessionCount ?? 0;

  return (
    <InfoPanel
      title="Security & sessions"
      icon={<Shield size={20} aria-hidden="true" />}
      variant="default"
    >
      <p>
        {sessionCount} active session{sessionCount === 1 ? "" : "s"} on your account. Login alerts
        are sent when configured email delivery is enabled.
      </p>
      <Link
        href={MEMBER_SECURITY_PATH}
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-royal-blue dark:text-light-blue"
      >
        <Smartphone size={16} aria-hidden="true" />
        Manage sessions & MFA
      </Link>
    </InfoPanel>
  );
}
