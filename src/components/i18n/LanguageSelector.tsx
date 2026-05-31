"use client";

import { Languages } from "lucide-react";
import { localeLabels, locales, type Locale } from "@/i18n/config";
import { useTranslation } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

type LanguageSelectorProps = {
  className?: string;
  selectClassName?: string;
  showIcon?: boolean;
  compact?: boolean;
};

export function LanguageSelector({
  className,
  selectClassName,
  showIcon = true,
  compact = false,
}: LanguageSelectorProps) {
  const { locale, setLocale, t } = useTranslation();

  return (
    <label
      className={cn(
        "inline-flex items-center gap-2 text-sm font-semibold text-primary-navy dark:text-white",
        className,
      )}
    >
      {showIcon ? <Languages size={16} aria-hidden="true" className="shrink-0 opacity-80" /> : null}
      <span className={cn(compact ? "sr-only" : "hidden sm:inline")}>{t("language.label")}</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        aria-label={t("language.choose")}
        className={cn(
          "rounded-full border border-primary-navy/[0.10] bg-white px-3 py-2 text-sm font-semibold text-primary-navy outline-none focus:border-ocean-blue dark:border-white/[0.10] dark:bg-white/[0.06] dark:text-white",
          selectClassName,
        )}
      >
        {locales.map((option) => (
          <option key={option} value={option}>
            {localeLabels[option]}
          </option>
        ))}
      </select>
    </label>
  );
}
