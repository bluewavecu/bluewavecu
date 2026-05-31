"use client";

import { StatementExportCard } from "@/components/accounts/StatementExportCard";

export function StatementsClient() {
  return (
    <section className="max-w-3xl">
      <StatementExportCard showHeader={false} />
    </section>
  );
}
