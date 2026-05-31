"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "@/i18n/LocaleProvider";

export function AppHeaderSearch() {
  const router = useRouter();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();

    if (!trimmed) {
      router.push("/auth/transactions");
      return;
    }

    router.push(`/transactions?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="hidden min-w-[280px] items-center gap-3 rounded-full border border-primary-navy/[0.08] bg-white px-4 py-3 text-sm text-bluewave-gray shadow-[0_12px_36px_rgba(10,42,94,0.06)] dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-white/[0.58] md:flex"
    >
      <Search size={17} aria-hidden="true" />
      <label className="sr-only" htmlFor="app-header-search">
        {t("common.searchPlaceholder")}
      </label>
      <input
        id="app-header-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("common.searchPlaceholder")}
        className="w-full bg-transparent text-primary-navy outline-none placeholder:text-bluewave-gray dark:text-white"
      />
    </form>
  );
}
