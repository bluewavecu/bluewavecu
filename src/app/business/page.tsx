import type { Metadata } from "next";
import { MarketingPageView } from "@/components/marketing/MarketingPageView";
import { marketingPages } from "@/data/marketingPages";

export const metadata: Metadata = {
  title: "Business Banking | Bluewave Credit Union",
  description: "Business checking, vendor payments, and cash flow tools for growing teams.",
};

export default function BusinessBankingPage() {
  return <MarketingPageView page={marketingPages.business} />;
}
