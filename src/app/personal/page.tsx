import type { Metadata } from "next";
import { MarketingPageView } from "@/components/marketing/MarketingPageView";
import { marketingPages } from "@/data/marketingPages";

export const metadata: Metadata = {
  title: "Personal Banking | Bluewave Credit Union",
  description: "Everyday checking, savings, transfers, and digital tools for personal members.",
};

export default function PersonalBankingPage() {
  return <MarketingPageView page={marketingPages.personal} />;
}
