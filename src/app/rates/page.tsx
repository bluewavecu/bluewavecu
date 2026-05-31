import { privatePageMetadata } from "@/lib/siteMetadata";
import { RatesPage } from "@/components/marketing/RatesPage";

export const metadata = privatePageMetadata("Rates");

export default function RatesRoutePage() {
  return <RatesPage />;
}
