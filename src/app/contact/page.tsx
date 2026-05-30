import type { Metadata } from "next";
import { mapContactTopic } from "@/lib/contact";
import { ContactPage } from "@/components/marketing/ContactPage";

export const metadata: Metadata = {
  title: "Contact | Bluewave Credit Union",
  description: "Contact Bluewave Credit Union for support, lending, business banking, and careers.",
};

type ContactRoutePageProps = {
  searchParams: Promise<{ topic?: string }>;
};

export default async function ContactRoutePage({ searchParams }: ContactRoutePageProps) {
  const params = await searchParams;

  return <ContactPage defaultTopic={mapContactTopic(params.topic)} />;
}
