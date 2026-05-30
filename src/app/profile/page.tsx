import { AppShell } from "@/components/layout/AppShell";
import { ProfileClient } from "@/components/profile/ProfileClient";

export default function ProfilePage() {
  return (
    <AppShell
      title="Profile"
      subtitle="Manage your personal details and identity verification status."
    >
      <ProfileClient />
    </AppShell>
  );
}
