import type { Metadata } from "next";
import { CareersPage } from "@/components/marketing/CareersPage";

export const metadata: Metadata = {
  title: "Careers | Bluewave Credit Union",
  description: "Explore careers at Bluewave Credit Union and help build modern member banking.",
};

export default function CareersRoutePage() {
  return <CareersPage />;
}
