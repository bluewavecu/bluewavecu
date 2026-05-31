import { Suspense } from "react";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import { MEMBER_LOGIN_PATH } from "@/lib/authRoutes";

export default function VerifyEmailPage() {
  return (
    <AuthPageShell
      eyebrow="Verify email"
      title="Confirm your email address"
      description="Enter the one-time code we sent to your inbox. After verification, sign in with your username and password."
      marketing={{
        badge: "Email verification",
        headline: "One quick step before sign-in.",
        body: "We use email verification to protect your membership application and make sure account alerts reach the right inbox.",
        highlights: ["6-digit one-time code", "Sign in after verification"],
      }}
      alternateAction={{
        prompt: "Already verified?",
        label: "Sign in",
        href: MEMBER_LOGIN_PATH,
      }}
    >
      <Suspense fallback={null}>
        <VerifyEmailForm />
      </Suspense>
    </AuthPageShell>
  );
}
