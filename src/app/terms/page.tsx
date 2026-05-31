import { privatePageMetadata } from "@/lib/siteMetadata";
import { LegalDocumentPage } from "@/components/marketing/LegalDocumentPage";
import { INSTITUTION } from "@/lib/institution";

export const metadata = privatePageMetadata("Terms");

const sections = [
  {
    title: "Acceptance of terms",
    paragraphs: [
      `By accessing ${INSTITUTION.legalName}'s website, mobile experience, or online banking services, you agree to these Terms of Use and any account agreements that apply to your membership.`,
      "If you do not agree, do not use our digital services.",
    ],
  },
  {
    title: "Membership and eligibility",
    paragraphs: [
      "Membership in Bluewave Credit Union is subject to field of membership requirements, verification, and approval. Account features, rates, and limits may vary by product and member profile.",
      "You are responsible for maintaining accurate contact information and promptly reviewing account statements and notifications.",
    ],
  },
  {
    title: "Online banking use",
    paragraphs: ["You agree to use online banking only for lawful purposes and in accordance with applicable account agreements."],
    bullets: [
      "Keep sign-in credentials, MFA devices, and one-time codes confidential",
      "Review transfers, bill payments, and card activity regularly",
      "Notify us promptly if you suspect unauthorized access or transactions",
      "Do not attempt to interfere with the security or operation of our systems",
    ],
  },
  {
    title: "Electronic communications",
    paragraphs: [
      "By using our digital services, you consent to receive required notices electronically where permitted, including alerts about account activity, security events, and service updates.",
    ],
  },
  {
    title: "Third-party links and services",
    paragraphs: [
      "Our website may reference third-party tools or links for convenience. We are not responsible for the content, privacy practices, or security of third-party sites or services.",
    ],
  },
  {
    title: "Disclaimer and limitation of liability",
    paragraphs: [
      "Digital banking is provided on an \"as available\" basis. To the extent permitted by law, Bluewave Credit Union is not liable for indirect, incidental, or consequential damages arising from use of the website or online banking, except where prohibited by applicable law or your account agreements.",
    ],
  },
  {
    title: "Changes",
    paragraphs: [
      "We may revise these Terms of Use at any time by posting an updated version on our website. Continued use after changes become effective constitutes acceptance of the revised terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalDocumentPage
      title="Terms of Use"
      description={`These terms govern your use of ${INSTITUTION.legalName}'s public website and digital banking channels.`}
      effectiveDate="May 30, 2026"
      sections={sections}
    />
  );
}
