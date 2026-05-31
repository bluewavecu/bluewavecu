import Link from "next/link";
import { AdminCommandPanel, AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import type { AdminSystemHealthData } from "@/types/banking";

type AdminSystemHealthProps = {
  data: AdminSystemHealthData;
};

export function AdminSystemHealth({ data }: AdminSystemHealthProps) {
  return (
    <article className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-primary-navy dark:text-white">System health</h2>
          <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
            Platform status, jobs, and reconciliation signals. Click any block to open the related
            operations page.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AdminStatusBadge status={data.status} />
          <Link
            href="/lex/auth/settings"
            className="text-sm font-semibold text-royal-blue transition hover:text-ocean-blue dark:text-light-blue"
          >
            Platform settings
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          label="Due jobs"
          value={data.jobs.due}
          hint={`${data.jobs.failed} failed`}
          tone={data.jobs.failed > 0 ? "warning" : "default"}
          href="/lex/auth/jobs"
        />
        <AdminMetricCard
          label="Reconciliation mismatches"
          value={data.reconciliation.mismatchCount}
          hint={`${data.reconciliation.noLedgerCount} without ledger`}
          tone={data.reconciliation.mismatchCount > 0 ? "warning" : "default"}
          href="/lex/auth/reconciliation"
        />
        <AdminMetricCard
          label="Email alerts"
          value={data.emailConfigured ? "Configured" : "Missing"}
          tone={data.emailConfigured ? "default" : "warning"}
          href="/lex/auth/settings"
        />
        <AdminMetricCard
          label="Cron secret"
          value={data.cronConfigured ? "Configured" : "Missing"}
          tone={data.cronConfigured ? "default" : "warning"}
          href="/lex/auth/settings"
        />
      </div>

      {data.recentCronEvents.length > 0 ? (
        <AdminCommandPanel title="Recent worker activity" href="/lex/auth/jobs" className="mt-5 border-0 bg-[#f7fbff] p-4 shadow-none dark:bg-white/[0.04]">
          <ul className="divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
            {data.recentCronEvents.map((event) => (
              <li key={event.id} className="py-2 text-sm first:pt-0 last:pb-0">
                <p className="font-medium text-primary-navy dark:text-white">{event.message}</p>
                <p className="text-xs text-bluewave-gray dark:text-white/[0.58]">{event.eventType}</p>
              </li>
            ))}
          </ul>
        </AdminCommandPanel>
      ) : null}
    </article>
  );
}
