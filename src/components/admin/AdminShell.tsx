import type { ReactNode } from "react";
import { AdminShellLayout } from "@/components/admin/AdminShellLayout";

type AdminShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

export function AdminShell(props: AdminShellProps) {
  return <AdminShellLayout {...props} />;
}
