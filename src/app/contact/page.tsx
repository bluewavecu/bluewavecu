import { privatePageMetadata } from "@/lib/siteMetadata";
import { mapContactTopic } from "@/lib/contact";
import { ContactPage } from "@/components/marketing/ContactPage";

export const metadata = privatePageMetadata("Contact");

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
