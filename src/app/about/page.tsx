import type { Metadata } from "next";
import { MarketingPageView } from "@/components/marketing/MarketingPageView";
import { marketingPages } from "@/data/marketingPages";

export const metadata: Metadata = {
  title: "About Us | Bluewave Credit Union",
  description: "Learn about Bluewave Credit Union, our mission, and member-first digital banking.",
};

export default function AboutPage() {
  return <MarketingPageView page={marketingPages.about} />;
}
