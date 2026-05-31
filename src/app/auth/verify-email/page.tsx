import { Suspense } from "react";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";

export default function VerifyEmailPage() {
  return (
    <AuthPageShell variant="verifyEmail">
      <Suspense fallback={null}>
        <VerifyEmailForm />
      </Suspense>
    </AuthPageShell>
  );
}
