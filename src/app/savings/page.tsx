import { privatePageMetadata } from "@/lib/siteMetadata";
import { MarketingPageView } from "@/components/marketing/MarketingPageView";
import { marketingPages } from "@/data/marketingPages";

export const metadata = privatePageMetadata("Savings");

export default function SavingsPage() {
  return <MarketingPageView page={marketingPages.savings} />;
}
