import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { MEMBER_LOGIN_PATH } from "@/lib/authRoutes";

export default function RegisterPage() {
  return (
    <AuthPageShell
      wide
      eyebrow="Enroll"
      title="Open your membership"
      description="Submit your application for online banking access. New memberships are reviewed before activation."
      marketing={{
        badge: "Membership enrollment",
        headline: "Join Bluewave Credit Union.",
        body: "Provide your personal and contact details so our team can verify eligibility and activate your accounts.",
        highlights: ["Choose your account types", "Account numbers after approval"],
      }}
      alternateAction={{
        prompt: "Already a member?",
        label: "Sign in",
        href: MEMBER_LOGIN_PATH,
      }}
    >
      <RegisterForm />
    </AuthPageShell>
  );
}
