import { privatePageMetadata } from "@/lib/siteMetadata";
import { MarketingPageView } from "@/components/marketing/MarketingPageView";
import { marketingPages } from "@/data/marketingPages";

export const metadata = privatePageMetadata("About");

export default function AboutPage() {
  return <MarketingPageView page={marketingPages.about} />;
}
