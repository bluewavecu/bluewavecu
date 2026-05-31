import { AdminShell } from "@/components/admin/AdminShell";
import { AdminTransferOtpClient } from "@/components/admin/AdminTransferOtpClient";

export default function AdminTransferOtpPage() {
  return (
    <AdminShell
      title="Transfer Verification"
      subtitle="Activate OTP steps and share codes with members before transfers."
    >
      <AdminTransferOtpClient />
    </AdminShell>
  );
}
