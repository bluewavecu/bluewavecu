import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { MEMBER_LOGIN_PATH } from "@/lib/authRoutes";

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell
      eyebrow="Online banking"
      title="Forgot your password?"
      description="Enter the email on your Bluewave membership and we'll send reset instructions."
      marketing={{
        badge: "Account recovery",
        headline: "We'll help you get back in.",
        body: "For your security, we send a one-time link and verification code to the email on your membership.",
        highlights: ["Secure reset link", "Six-digit verification code"],
      }}
      alternateAction={{
        prompt: "Remember your password?",
        label: "Sign in",
        href: MEMBER_LOGIN_PATH,
      }}
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
