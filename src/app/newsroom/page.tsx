import { privatePageMetadata } from "@/lib/siteMetadata";
import { NewsroomPage } from "@/components/marketing/NewsroomPage";

export const metadata = privatePageMetadata("Newsroom");

export default function NewsroomRoutePage() {
  return <NewsroomPage />;
}
