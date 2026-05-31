import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

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
        highlights: ["Identity verification", "Pending account review"],
      }}
      alternateAction={{
        prompt: "Already a member?",
        label: "Sign in",
        href: "/auth",
      }}
    >
      <RegisterForm />
    </AuthPageShell>
  );
}
