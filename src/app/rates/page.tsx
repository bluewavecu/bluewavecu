import type { Metadata } from "next";
import { RatesPage } from "@/components/marketing/RatesPage";

export const metadata: Metadata = {
  title: "Rates | Bluewave Credit Union",
  description: "Compare checking, savings, certificate, and lending rates at Bluewave Credit Union.",
};

export default function RatesRoutePage() {
  return <RatesPage />;
}
