import { AdminCommandCenter } from "@/components/admin/AdminCommandCenter";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminPage() {
  return (
    <AdminShell
      title="Command Center"
      subtitle="Banking operations overview, alerts, and review queues."
    >
      <AdminCommandCenter />
    </AdminShell>
  );
}
