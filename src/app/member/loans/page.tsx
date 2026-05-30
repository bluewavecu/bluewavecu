import type { Metadata } from "next";
import { MarketingPageView } from "@/components/marketing/MarketingPageView";
import { marketingPages } from "@/data/marketingPages";

export const metadata: Metadata = {
  title: "Loans & Lending | Bluewave Credit Union",
  description: "Auto, personal, and home lending with member-first support and clear rates.",
};

export default function LoansPage() {
  return <MarketingPageView page={marketingPages.loans} />;
}
