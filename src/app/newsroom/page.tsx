import type { Metadata } from "next";
import { NewsroomPage } from "@/components/marketing/NewsroomPage";

export const metadata: Metadata = {
  title: "Newsroom | Bluewave Credit Union",
  description: "Product updates, community news, and rate announcements from Bluewave Credit Union.",
};

export default function NewsroomRoutePage() {
  return <NewsroomPage />;
}
