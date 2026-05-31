import { privatePageMetadata } from "@/lib/siteMetadata";
import { SupportHubPage } from "@/components/marketing/SupportHubPage";

export const metadata = privatePageMetadata("Support");

export default function SupportPage() {
  return <SupportHubPage />;
}
