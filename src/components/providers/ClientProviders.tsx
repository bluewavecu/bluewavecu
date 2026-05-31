"use client";

import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { LocaleProvider } from "@/i18n/LocaleProvider";

type ClientProvidersProps = {
  children: ReactNode;
  initialLocale: Locale;
};

export function ClientProviders({ children, initialLocale }: ClientProvidersProps) {
  return <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>;
}
