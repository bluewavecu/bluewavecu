import { CardsClient } from "@/components/cards/CardsClient";
import { AppShell } from "@/components/layout/AppShell";

export default function CardsPage() {
  return (
    <AppShell
      title="Cards"
      subtitle="Apply for a Bluewave Mastercard, manage card controls, and review card purchase activity."
    >
      <CardsClient />
    </AppShell>
  );
}
