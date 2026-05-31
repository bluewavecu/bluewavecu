import { privatePageMetadata } from "@/lib/siteMetadata";
import { SecurityTrustPage } from "@/components/marketing/SecurityTrustPage";

export const metadata = privatePageMetadata("Security");

export default function SecurityPage() {
  return <SecurityTrustPage />;
}
