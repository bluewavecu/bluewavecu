import { privatePageMetadata } from "@/lib/siteMetadata";
import { MarketingPageView } from "@/components/marketing/MarketingPageView";
import { marketingPages } from "@/data/marketingPages";

export const metadata = privatePageMetadata("Business");

export default function BusinessBankingPage() {
  return <MarketingPageView page={marketingPages.business} />;
}
