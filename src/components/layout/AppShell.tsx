import type { ReactNode } from "react";
import { AppShellLayout } from "@/components/layout/AppShellLayout";

type AppShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  hideHeaderSearch?: boolean;
  compactMobileHeader?: boolean;
};

export function AppShell(props: AppShellProps) {
  return <AppShellLayout {...props} />;
}
