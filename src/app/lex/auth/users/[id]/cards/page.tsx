import { AdminMemberCardsClient } from "@/components/admin/AdminMemberCardsClient";
import { AdminShell } from "@/components/admin/AdminShell";

type AdminMemberCardsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminMemberCardsPage({ params }: AdminMemberCardsPageProps) {
  const { id } = await params;

  return (
    <AdminShell title="Member cards" subtitle="Issue and review Mastercard products for a member.">
      <AdminMemberCardsClient userId={id} />
    </AdminShell>
  );
}
