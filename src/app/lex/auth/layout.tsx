import type { ReactNode } from "react";
import { blockSearchIndexing } from "@/lib/siteMetadata";

export const metadata = blockSearchIndexing;

export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return children;
}
