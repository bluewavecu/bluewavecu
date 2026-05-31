import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell variant="forgotPassword">
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
