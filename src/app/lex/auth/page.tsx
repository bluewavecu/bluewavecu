import { Suspense } from "react";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { LoginForm } from "@/components/auth/LoginForm";

export default function OperationsAuthPage() {
  return (
    <AuthPageShell variant="adminLogin">
      <Suspense
        fallback={
          <p className="text-sm text-bluewave-gray dark:text-white/[0.62]">Loading sign-in form...</p>
        }
      >
        <LoginForm portal="admin" />
      </Suspense>
    </AuthPageShell>
  );
}
