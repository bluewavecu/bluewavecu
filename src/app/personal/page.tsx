import { privatePageMetadata } from "@/lib/siteMetadata";
import { MarketingPageView } from "@/components/marketing/MarketingPageView";
import { marketingPages } from "@/data/marketingPages";

export const metadata = privatePageMetadata("Personal");

export default function PersonalBankingPage() {
  return <MarketingPageView page={marketingPages.personal} />;
}
