import { CardsClient } from "@/components/cards/CardsClient";
import { AppShell } from "@/components/layout/AppShell";

export default function CardsPage() {
  return (
    <AppShell title="Cards" subtitle="Apply, manage controls, and review activity.">
      <CardsClient />
    </AppShell>
  );
}
