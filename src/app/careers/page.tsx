import { privatePageMetadata } from "@/lib/siteMetadata";
import { CareersPage } from "@/components/marketing/CareersPage";

export const metadata = privatePageMetadata("Careers");

export default function CareersRoutePage() {
  return <CareersPage />;
}
