import type { Metadata } from "next";
import { SupportHubPage } from "@/components/marketing/SupportHubPage";

export const metadata: Metadata = {
  title: "Support | Bluewave Credit Union",
  description: "Get help with accounts, transfers, cards, and digital banking at Bluewave Credit Union.",
};

export default function SupportPage() {
  return <SupportHubPage />;
}
