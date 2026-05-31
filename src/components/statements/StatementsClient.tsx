"use client";

import { FileSpreadsheet, FileText } from "lucide-react";
import { StatementExportCard } from "@/components/accounts/StatementExportCard";
import { InfoPanel } from "@/components/ui/InfoPanel";

export function StatementsClient() {
  return (
    <section className="grid gap-5">
      <InfoPanel title="Statement availability">
        Statements include posted transactions and ending balances when available. Pending transfers
        and bill payments appear after member services review and posting. Account numbers are always
        masked in exports.
      </InfoPanel>

      <StatementExportCard />

      <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
        <h2 className="text-lg font-semibold text-primary-navy dark:text-white">
          Statement history
        </h2>
        <p className="mt-2 text-sm leading-6 text-bluewave-gray dark:text-white/[0.58]">
          Download prior statements using the export tool above. Your full statement archive will
          appear here as additional months are posted.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-ocean-blue/[0.10] px-3 py-1 text-xs font-semibold text-royal-blue dark:text-light-blue">
            <FileSpreadsheet size={14} aria-hidden="true" />
            CSV default
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-ocean-blue/[0.10] px-3 py-1 text-xs font-semibold text-royal-blue dark:text-light-blue">
            <FileText size={14} aria-hidden="true" />
            PDF available
          </span>
        </div>
      </div>
    </section>
  );
}
