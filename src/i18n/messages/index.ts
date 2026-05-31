import type { Locale } from "@/i18n/config";
import { en, type Messages } from "./en";
import { es } from "./es";
import { zh } from "./zh";
import { fr } from "./fr";
import { ar } from "./ar";
import { pt } from "./pt";

export type { Messages };
export { en };

export const messages: Record<Locale, Messages> = {
  en,
  es,
  zh,
  fr,
  ar,
  pt,
};
