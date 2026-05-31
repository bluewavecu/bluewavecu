import { AppShell } from "@/components/layout/AppShell";
import { ForgotTransactionPinForm } from "@/components/security/ForgotTransactionPinForm";

export default function ForgotTransactionPinPage() {
  return (
    <AppShell
      compactMobileHeader
      title="Reset transaction PIN"
      subtitle="Verify your identity with a one-time email code, then choose a new 6-digit PIN."
      hideHeaderSearch
    >
      <div className="mx-auto max-w-xl rounded-xl border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06] sm:p-6">
        <ForgotTransactionPinForm />
      </div>
    </AppShell>
  );
}
