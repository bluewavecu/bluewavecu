import { Suspense } from "react";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthPageShell variant="resetPassword">
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
