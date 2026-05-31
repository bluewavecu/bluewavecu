export const LOCALE_COOKIE = "bluewave_locale";

export const locales = ["en", "es", "zh", "fr", "ar", "pt"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  es: "Español",
  zh: "中文",
  fr: "Français",
  ar: "العربية",
  pt: "Português",
};

export const rtlLocales: Locale[] = ["ar"];

export function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export function getLocaleDirection(locale: Locale) {
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}
