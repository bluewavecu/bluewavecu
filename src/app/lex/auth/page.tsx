import { Suspense } from "react";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { LoginForm } from "@/components/auth/LoginForm";

export default function OperationsAuthPage() {
  return (
    <AuthPageShell
      eyebrow="Operations access"
      title="Authorized sign-in"
      description="Restricted access for authorized Bluewave operations personnel only."
      marketing={{
        badge: "Operations console",
        headline: "Secure administrative access.",
        body: "Review transfers, bill payments, compliance queues, and member servicing workflows through audited controls.",
        highlights: ["Role-based access", "Immutable audit trail"],
      }}
    >
      <Suspense
        fallback={
          <p className="text-sm text-bluewave-gray dark:text-white/[0.62]">Loading sign-in form...</p>
        }
      >
        <LoginForm portal="admin" />
      </Suspense>
    </AuthPageShell>
  );
}
