"use client";

import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";
import { useAccounts } from "@/hooks/useAccounts";
import { cn } from "@/lib/utils";

type StatementExportCardProps = {
  className?: string;
  showHeader?: boolean;
};

const fieldClassName =
  "mt-1.5 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-3 py-2.5 text-sm text-primary-navy outline-none focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white";

export function StatementExportCard({ className, showHeader = true }: StatementExportCardProps) {
  const { data } = useAccounts();
  const now = new Date();
  const [accountId, setAccountId] = useState("");
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleExport(format: "csv" | "pdf") {
    const setExporting = format === "csv" ? setIsExportingCsv : setIsExportingPdf;
    setExporting(true);
    setError(null);
    setSuccessMessage(null);

    const params = new URLSearchParams({
      month,
      year,
      format,
    });

    if (accountId) {
      params.set("accountId", accountId);
    }

    try {
      const response = await fetch(`/api/statements?${params.toString()}`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        const contentType = response.headers.get("Content-Type") ?? "";

        if (contentType.includes("application/json")) {
          const payload = (await response.json()) as { error?: string };
          setError(payload.error ?? "Unable to export statement.");
        } else {
          setError("Unable to export statement.");
        }

        setExporting(false);
        return;
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="(.+)"/);
      const defaultExt = format === "pdf" ? "pdf" : "csv";
      const filename =
        filenameMatch?.[1] ?? `bluewave-statement-${year}-${month}.${defaultExt}`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      setSuccessMessage(format === "pdf" ? "PDF downloaded." : "CSV downloaded.");
    } catch {
      setError("Unable to export statement.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <section
      className={cn(
        "rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]",
        className,
      )}
    >
      {showHeader ? (
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ocean-blue/[0.12] text-royal-blue dark:text-light-blue">
            <FileSpreadsheet size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Statements</h2>
            <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
              CSV or PDF for the selected month.
            </p>
          </div>
        </div>
      ) : null}

      <div className={cn("grid gap-4 md:grid-cols-3", showHeader ? "mt-5" : "")}>
        <label className="block">
          <span className="text-sm font-semibold text-primary-navy dark:text-white">Account</span>
          <select
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
            className={fieldClassName}
          >
            <option value="">All accounts</option>
            {data?.accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.displayName} ({account.maskedAccountNumber})
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-primary-navy dark:text-white">Month</span>
          <select
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            className={fieldClassName}
          >
            {Array.from({ length: 12 }, (_, index) => {
              const value = String(index + 1);
              return (
                <option key={value} value={value}>
                  {new Date(2026, index, 1).toLocaleString("en-US", { month: "long" })}
                </option>
              );
            })}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-primary-navy dark:text-white">Year</span>
          <select
            value={year}
            onChange={(event) => setYear(event.target.value)}
            className={fieldClassName}
          >
            {[now.getFullYear(), now.getFullYear() - 1].map((value) => (
              <option key={value} value={String(value)}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-700 dark:text-red-300">{error}</p>
      ) : null}
      {successMessage ? (
        <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-300">{successMessage}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2.5">
        <button
          type="button"
          disabled={isExportingCsv || isExportingPdf}
          onClick={() => void handleExport("csv")}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-ocean-blue px-4 text-sm font-semibold text-primary-navy transition hover:bg-light-blue disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Download size={16} aria-hidden="true" />
          {isExportingCsv ? "Preparing..." : "Download CSV"}
        </button>

        <button
          type="button"
          disabled={isExportingCsv || isExportingPdf}
          onClick={() => void handleExport("pdf")}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-primary-navy/[0.12] bg-white px-4 text-sm font-semibold text-primary-navy transition hover:border-ocean-blue hover:text-royal-blue disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/[0.12] dark:bg-white/[0.06] dark:text-white"
        >
          <FileText size={16} aria-hidden="true" />
          {isExportingPdf ? "Preparing..." : "Download PDF"}
        </button>
      </div>
    </section>
  );
}
