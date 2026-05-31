import { AppShell } from "@/components/layout/AppShell";
import { SettingsClient } from "@/components/settings/SettingsClient";

export default function SettingsPage() {
  return (
    <AppShell title="Settings" subtitle="Manage communication, privacy, and display preferences.">
      <SettingsClient />
    </AppShell>
  );
}
