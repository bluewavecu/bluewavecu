import type { Metadata } from "next";
import { mapContactTopic } from "@/lib/contact";
import { ContactPage } from "@/components/marketing/ContactPage";

export const metadata: Metadata = {
  title: "Contact | Bluewave Credit Union",
  description: "Contact Bluewave Credit Union for support, lending, business banking, and careers.",
};

type ContactRoutePageProps = {
  searchParams: Promise<{ topic?: string; role?: string }>;
};

export default async function ContactRoutePage({ searchParams }: ContactRoutePageProps) {
  const params = await searchParams;
  const defaultTopic = mapContactTopic(params.topic);
  const defaultMessage =
    params.role && params.topic?.toLowerCase() === "careers"
      ? `I am interested in the ${params.role} position.`
      : undefined;

  return <ContactPage defaultTopic={defaultTopic} defaultMessage={defaultMessage} />;
}
