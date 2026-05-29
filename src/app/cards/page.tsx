import { CardsClient } from "@/components/dashboard/CardsClient";
import { AppShell } from "@/components/layout/AppShell";

export default function CardsPage() {
  return (
    <AppShell
      title="Cards"
      subtitle="Manage authenticated card previews and control placeholders from one screen."
    >
      <CardsClient />
    </AppShell>
  );
}
