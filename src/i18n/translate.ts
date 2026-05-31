import { defaultLocale, type Locale } from "@/i18n/config";
import { messages, type Messages } from "@/i18n/messages";

type TranslationParams = Record<string, string | number>;

function getNestedValue(source: Messages, key: string) {
  return key.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }

    return undefined;
  }, source);
}

function interpolate(template: string, params?: TranslationParams) {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, token: string) => {
    const value = params[token];
    return value === undefined ? `{${token}}` : String(value);
  });
}

export function translate(locale: Locale, key: string, params?: TranslationParams) {
  const localized = getNestedValue(messages[locale], key);
  const fallback = getNestedValue(messages[defaultLocale], key);
  const value = localized ?? fallback;

  if (typeof value === "string") {
    return interpolate(value, params);
  }

  return key;
}
