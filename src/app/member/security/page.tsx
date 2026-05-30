import type { Metadata } from "next";
import { SecurityTrustPage } from "@/components/marketing/SecurityTrustPage";

export const metadata: Metadata = {
  title: "Security | Bluewave Credit Union",
  description: "Learn how Bluewave protects members with MFA, session controls, and fraud monitoring.",
};

export default function SecurityPage() {
  return <SecurityTrustPage />;
}
