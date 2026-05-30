import { AdminShell } from "@/components/admin/AdminShell";
import { AdminComplianceClient } from "@/components/admin/AdminComplianceClient";

export default function AdminCompliancePage() {
  return (
    <AdminShell
      title="Compliance"
      subtitle="Review customer profiles and update KYC verification status."
    >
      <AdminComplianceClient />
    </AdminShell>
  );
}
