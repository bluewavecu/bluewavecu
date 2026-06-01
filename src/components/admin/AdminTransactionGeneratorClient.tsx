"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/formatCurrency";
import { postJson } from "@/lib/clientApi";
import type { AdminAccountRecord, AdminUserSummaryWithKyc } from "@/types/banking";

const fieldClassName =
  "mt-1.5 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-3 py-2.5 text-sm text-primary-navy outline-none focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white";

function formatDateInputValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

function getDefaultFromDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return formatDateInputValue(date);
}

type GenerateResult = {
  created: number;
  creditCount: number;
  debitCount: number;
  netAmount: number;
  priorBalance: number;
  closingBalance: number;
  fromDate: string;
  toDate: string;
};

export function AdminTransactionGeneratorClient() {
  const [users, setUsers] = useState<AdminUserSummaryWithKyc[]>([]);
  const [accounts, setAccounts] = useState<AdminAccountRecord[]>([]);
  const [userId, setUserId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [creditCount, setCreditCount] = useState("26");
  const [debitCount, setDebitCount] = useState("40");
  const [fromDate, setFromDate] = useState(getDefaultFromDate);
  const [toDate, setToDate] = useState(() => formatDateInputValue(new Date()));
  const [payrollCompanyName, setPayrollCompanyName] = useState("");
  const [activityCities, setActivityCities] = useState("Dallas, TX, Plano, TX, Irving, TX");
  const [payrollPaycheckMin, setPayrollPaycheckMin] = useState("1800");
  const [payrollPaycheckMax, setPayrollPaycheckMax] = useState("3200");
  const [includeCardAndUtilityActivity, setIncludeCardAndUtilityActivity] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);

  const fetchUsers = useCallback(async () => {
    const response = await fetch("/api/admin/users?role=USER", {
      credentials: "include",
      cache: "no-store",
    });
    const payload = (await response.json()) as {
      success: boolean;
      data?: { users: AdminUserSummaryWithKyc[] };
    };

    if (payload.success && payload.data) {
      setUsers(payload.data.users.filter((user) => user.status === "ACTIVE"));
    }
  }, []);

  const fetchAccounts = useCallback(async () => {
    const response = await fetch("/api/admin/accounts", { credentials: "include", cache: "no-store" });
    const payload = (await response.json()) as {
      success: boolean;
      data?: { accounts: AdminAccountRecord[] };
    };

    if (payload.success && payload.data) {
      setAccounts(payload.data.accounts);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        void fetchUsers();
        void fetchAccounts();
      }
    });

    return () => controller.abort();
  }, [fetchAccounts, fetchUsers]);

  const userAccounts = useMemo(() => {
    if (!userId) {
      return [];
    }

    return accounts.filter((account) => account.user.id === userId);
  }, [accounts, userId]);

  const selectedAccount = useMemo(
    () => userAccounts.find((account) => account.id === accountId) ?? null,
    [accountId, userAccounts],
  );

  const totalCount = Number(creditCount || 0) + Number(debitCount || 0);
  const minFromDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 20);
    return formatDateInputValue(date);
  }, []);

  useEffect(() => {
    if (!accountId || userAccounts.some((account) => account.id === accountId)) {
      return;
    }

    queueMicrotask(() => {
      setAccountId("");
    });
  }, [accountId, userAccounts]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setIsSubmitting(true);

    const response = await postJson<{ result: GenerateResult }>("/api/admin/transactions/generate", {
      userId,
      accountId,
      creditCount: Number(creditCount),
      debitCount: Number(debitCount),
      fromDate,
      toDate,
      payrollCompanyName: payrollCompanyName.trim() || undefined,
      activityCities: activityCities.trim() || undefined,
      payrollPaycheckMin: payrollPaycheckMin.trim() ? Number(payrollPaycheckMin) : undefined,
      payrollPaycheckMax: payrollPaycheckMax.trim() ? Number(payrollPaycheckMax) : undefined,
      includeCardAndUtilityActivity,
    });

    setIsSubmitting(false);

    if (!response.success) {
      setError("error" in response ? response.error : "Unable to generate transactions.");
      return;
    }

    setResult(response.data.result);
  }

  return (
    <section className="grid gap-5">
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="max-w-3xl rounded-lg border border-primary-navy/[0.08] bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.06]"
      >
        <h2 className="text-lg font-semibold">Generate member transactions</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold">Member</span>
            <select
              required
              value={userId}
              onChange={(event) => {
                setUserId(event.target.value);
                setAccountId("");
              }}
              className={fieldClassName}
            >
              <option value="">Select member</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName} ({user.username})
                </option>
              ))}
            </select>
          </label>

          {userId ? (
            <div className="md:col-span-2 rounded-lg border border-ocean-blue/25 bg-ocean-blue/[0.06] p-4 dark:border-ocean-blue/30 dark:bg-ocean-blue/[0.08]">
              <h3 className="text-sm font-semibold text-primary-navy dark:text-white">
                Activity profile
              </h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="text-sm font-semibold">Payroll company name</span>
                  <input
                    type="text"
                    value={payrollCompanyName}
                    onChange={(event) => setPayrollCompanyName(event.target.value)}
                    placeholder="e.g. Texas Instruments Payroll"
                    className={fieldClassName}
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-sm font-semibold">Activity cities (comma-separated)</span>
                  <input
                    type="text"
                    value={activityCities}
                    onChange={(event) => setActivityCities(event.target.value)}
                    placeholder="Dallas, TX, Plano, TX, Fort Worth, TX"
                    className={fieldClassName}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Typical paycheck (min)</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={payrollPaycheckMin}
                    onChange={(event) => setPayrollPaycheckMin(event.target.value)}
                    className={fieldClassName}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Typical paycheck (max)</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={payrollPaycheckMax}
                    onChange={(event) => setPayrollPaycheckMax(event.target.value)}
                    className={fieldClassName}
                  />
                </label>
                <label className="flex items-center gap-2 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={includeCardAndUtilityActivity}
                    onChange={(event) => setIncludeCardAndUtilityActivity(event.target.checked)}
                  />
                  <span className="text-sm font-semibold">
                    Include card purchases and utility-style debits
                  </span>
                </label>
              </div>
            </div>
          ) : null}

          <label className="block">
            <span className="text-sm font-semibold">Account</span>
            <select
              required
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
              disabled={!userId}
              className={fieldClassName}
            >
              <option value="">Select account</option>
              {userAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.displayName} ({account.maskedAccountNumber}) · {formatCurrency(account.balance)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Credits</span>
            <input
              required
              type="number"
              min="0"
              max="1000"
              value={creditCount}
              onChange={(event) => setCreditCount(event.target.value)}
              className={fieldClassName}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">Debits</span>
            <input
              required
              type="number"
              min="0"
              max="1000"
              value={debitCount}
              onChange={(event) => setDebitCount(event.target.value)}
              className={fieldClassName}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">From date</span>
            <input
              required
              type="date"
              min={minFromDate}
              max={toDate}
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className={fieldClassName}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold">To date</span>
            <input
              required
              type="date"
              min={fromDate}
              max={formatDateInputValue(new Date())}
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className={fieldClassName}
            />
          </label>
        </div>

        <p className="mt-4 text-sm text-bluewave-gray dark:text-white/[0.58]">
          {totalCount} transactions · mixed credits and debits
          {selectedAccount ? <> · Balance {formatCurrency(selectedAccount.balance)}</> : null}
        </p>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-200">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || !userId || totalCount < 1 || totalCount > 1000}
          className="mt-4 inline-flex h-10 items-center rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy disabled:opacity-70"
        >
          {isSubmitting ? "Generating..." : "Generate transactions"}
        </button>
      </form>

      {result ? (
        <article className="max-w-3xl rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm dark:text-white">
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-bluewave-gray dark:text-white/[0.58]">Created</dt>
              <dd className="font-semibold">{result.created}</dd>
            </div>
            <div>
              <dt className="text-bluewave-gray dark:text-white/[0.58]">Credits / debits</dt>
              <dd className="font-semibold">
                {result.creditCount} / {result.debitCount}
              </dd>
            </div>
            <div>
              <dt className="text-bluewave-gray dark:text-white/[0.58]">Net change</dt>
              <dd className="font-semibold">{formatCurrency(result.netAmount)}</dd>
            </div>
            <div>
              <dt className="text-bluewave-gray dark:text-white/[0.58]">Balance</dt>
              <dd className="font-semibold">
                {formatCurrency(result.priorBalance)} → {formatCurrency(result.closingBalance)}
              </dd>
            </div>
          </dl>
        </article>
      ) : null}
    </section>
  );
}
