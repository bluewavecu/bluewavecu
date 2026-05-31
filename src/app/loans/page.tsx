import { privatePageMetadata } from "@/lib/siteMetadata";
import { MarketingPageView } from "@/components/marketing/MarketingPageView";
import { marketingPages } from "@/data/marketingPages";

export const metadata = privatePageMetadata("Loans");

export default function LoansPage() {
  return <MarketingPageView page={marketingPages.loans} />;
}
