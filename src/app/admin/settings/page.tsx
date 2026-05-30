import { AdminSettingsClient } from "@/components/admin/AdminSettingsClient";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminSettingsPage() {
  return (
    <AdminShell
      title="System Settings"
      subtitle="Read-only environment and feature configuration."
    >
      <AdminSettingsClient />
    </AdminShell>
  );
}
