import { CardsClient } from "@/components/cards/CardsClient";
import { AppShell } from "@/components/layout/AppShell";

export default function CardsPage() {
  return (
    <AppShell
      title="Cards"
      subtitle="Manage debit and credit card previews with safe demo controls."
    >
      <CardsClient />
    </AppShell>
  );
}
