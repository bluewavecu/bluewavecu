import { Suspense } from "react";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthPageShell
      eyebrow="Sign in"
      title="Welcome back"
      description="Enter your member credentials to access online banking."
      marketing={{
        badge: "Secure online banking",
        headline: "Sign in to manage your accounts.",
        body: "Access balances, transfers, statements, and member services through encrypted online banking.",
        highlights: ["Encrypted sign-in", "Account activity monitoring"],
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
        <LoginForm />
      </Suspense>
    </AuthPageShell>
  );
}
