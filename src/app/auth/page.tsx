import { Suspense } from "react";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { LoginForm } from "@/components/auth/LoginForm";

export default function MemberAuthPage() {
  return (
    <AuthPageShell
      eyebrow="Online banking"
      title="Member sign in"
      description="Enter your member credentials to access accounts, transfers, and account services."
      marketing={{
        badge: "Secure online banking",
        headline: "Sign in to manage your accounts.",
        body: "Access balances, transfers, bill pay, statements, and member services through encrypted online banking.",
        highlights: ["256-bit encryption", "Account activity monitoring"],
      }}
      alternateAction={{
        prompt: "New to Bluewave?",
        label: "Open an account",
        href: "/register",
      }}
    >
      <Suspense
        fallback={
          <p className="text-sm text-bluewave-gray dark:text-white/[0.62]">Loading sign-in form...</p>
        }
      >
        <LoginForm portal="member" />
      </Suspense>
    </AuthPageShell>
  );
}
