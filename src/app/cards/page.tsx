import { CardsClient } from "@/components/cards/CardsClient";
import { AppShell } from "@/components/layout/AppShell";

export default function CardsPage() {
  return (
    <AppShell
      title="Cards"
      subtitle="Manage debit and credit cards, lock or unlock cards, and request replacements."
    >
      <CardsClient />
    </AppShell>
  );
}
