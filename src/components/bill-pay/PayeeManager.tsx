"use client";

import { FormEvent, useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { usePayees } from "@/hooks/usePayees";

export function PayeeManager() {
  const { payees, error, isLoading, isSubmitting, createPayee, deletePayee } = usePayees();
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [category, setCategory] = useState("Utilities");
  const [accountNumber, setAccountNumber] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(null);

    const createdPayee = await createPayee({
      name: name.trim(),
      nickname: nickname.trim() || undefined,
      category: category.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
    });

    if (createdPayee) {
      setSuccessMessage("Payee added.");
      setName("");
      setNickname("");
      setAccountNumber("");
    }
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]"
      >
        <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Add payee</h2>
        <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
          Saved payees for quick bill payments.
        </p>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-primary-navy dark:text-white">Name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-primary-navy dark:text-white">Nickname</span>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-primary-navy dark:text-white">Category</span>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-primary-navy dark:text-white">
              Account number
            </span>
            <input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="mt-2 w-full rounded-lg border border-primary-navy/[0.10] bg-[#f7fbff] px-4 py-3 text-sm dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white"
            />
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-red-700 dark:text-red-300">{error}</p> : null}
        {successMessage ? (
          <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-300">{successMessage}</p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-ocean-blue px-5 text-sm font-semibold text-primary-navy disabled:opacity-70"
        >
          <UserPlus size={16} aria-hidden="true" />
          {isSubmitting ? "Saving..." : "Add payee"}
        </button>
      </form>

      <div className="rounded-lg border border-primary-navy/[0.08] bg-white p-5 shadow-[0_18px_60px_rgba(10,42,94,0.08)] dark:border-white/[0.08] dark:bg-white/[0.06]">
        <h2 className="text-lg font-semibold text-primary-navy dark:text-white">Your payees</h2>
        {isLoading ? (
          <p className="mt-4 text-sm text-bluewave-gray dark:text-white/[0.58]">Loading...</p>
        ) : payees.length > 0 ? (
          <div className="mt-4 divide-y divide-primary-navy/[0.08] dark:divide-white/[0.08]">
            {payees.map((payee) => (
              <div
                key={payee.id}
                className="flex items-start justify-between gap-3 py-4 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-semibold text-primary-navy dark:text-white">
                    {payee.nickname ?? payee.name}
                  </p>
                  <p className="mt-1 text-sm text-bluewave-gray dark:text-white/[0.58]">
                    {payee.category ?? "General"} | {payee.maskedAccountNumber ?? "No account on file"}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void deletePayee(payee.id)}
                  className="inline-flex h-9 items-center gap-1 rounded-full border border-primary-navy/[0.10] px-3 text-xs font-semibold text-red-700 dark:text-red-300"
                >
                  <Trash2 size={14} aria-hidden="true" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-bluewave-gray dark:text-white/[0.58]">No payees yet.</p>
        )}
      </div>
    </section>
  );
}
