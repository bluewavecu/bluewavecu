import type { Metadata } from "next";
import { MarketingPageView } from "@/components/marketing/MarketingPageView";
import { marketingPages } from "@/data/marketingPages";

export const metadata: Metadata = {
  title: "Savings Accounts | Bluewave Credit Union",
  description: "High-yield savings and goal-friendly balances with transparent digital tools.",
};

export default function SavingsPage() {
  return <MarketingPageView page={marketingPages.savings} />;
}
