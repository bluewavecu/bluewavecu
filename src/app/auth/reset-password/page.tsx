import { Suspense } from "react";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthPageShell
      eyebrow="Online banking"
      title="Choose a new password"
      description="Use the secure link from your email, or enter your email and the six-digit verification code we sent you."
      marketing={{
        badge: "Account recovery",
        headline: "Set a new password for online banking.",
        body: "Choose a unique password with at least 8 characters. After updating, sign in with your new credentials.",
        highlights: ["One-time reset link", "Verification code backup"],
      }}
      alternateAction={{
        prompt: "Need a new reset email?",
        label: "Request instructions",
        href: "/auth/forgot-password",
      }}
    >
      <Suspense
        fallback={
          <p className="text-sm text-bluewave-gray dark:text-white/[0.62]">Loading reset form...</p>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthPageShell>
  );
}
