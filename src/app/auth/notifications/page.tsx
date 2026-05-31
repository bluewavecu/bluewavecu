import { AppShell } from "@/components/layout/AppShell";
import { NotificationsClient } from "@/components/notifications/NotificationsClient";

export default function NotificationsPage() {
  return (
    <AppShell title="Notifications" subtitle="Review alerts for transfers, support, security, and account activity.">
      <NotificationsClient />
    </AppShell>
  );
}
