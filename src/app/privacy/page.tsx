import { privatePageMetadata } from "@/lib/siteMetadata";
import { LegalDocumentPage } from "@/components/marketing/LegalDocumentPage";
import { INSTITUTION } from "@/lib/institution";

export const metadata = privatePageMetadata("Privacy");

const sections = [
  {
    title: "Information we collect",
    paragraphs: [
      "We collect information you provide when you apply for membership, open accounts, use online banking, contact member services, or interact with our website and mobile experience.",
      "This may include contact details, identification information, account and transaction data, device and session information, and communications you send to us.",
    ],
  },
  {
    title: "How we use information",
    paragraphs: ["We use member information to provide financial services, protect accounts, and comply with applicable law."],
    bullets: [
      "Process transactions, transfers, bill payments, and account servicing",
      "Verify identity, prevent fraud, and monitor for unusual activity",
      "Respond to support requests and send required account notices",
      "Improve our digital banking tools and member experience",
      "Meet regulatory, audit, and NCUA reporting obligations",
    ],
  },
  {
    title: "How we share information",
    paragraphs: [
      "We do not sell member personal information. We may share information with service providers that help us operate online banking, payment processing, card programs, and member support — under contracts that require appropriate safeguards.",
      "We may also disclose information when required by law, to protect members and the credit union, or with your authorization.",
    ],
  },
  {
    title: "Security and retention",
    paragraphs: [
      "We use administrative, technical, and physical safeguards designed to protect member information, including encryption, access controls, and activity monitoring.",
      "We retain information for as long as needed to provide services, resolve disputes, and satisfy legal and regulatory requirements.",
    ],
  },
  {
    title: "Your choices",
    paragraphs: [
      "You may update profile information through online banking or by contacting member services. Marketing preferences can be adjusted by contacting us or using opt-out instructions in promotional messages.",
      "Certain notices related to your accounts, security, or legal obligations may still be sent even if you opt out of marketing communications.",
    ],
  },
  {
    title: "Children's privacy",
    paragraphs: [
      "Our services are intended for members and prospective members. We do not knowingly collect personal information online from children under 13 without appropriate parental consent.",
    ],
  },
  {
    title: "Changes to this policy",
    paragraphs: [
      `We may update this Privacy Policy from time to time. Material changes will be posted on ${INSTITUTION.legalName}'s website with an updated effective date.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocumentPage
      title="Privacy Policy"
      description={`${INSTITUTION.legalName} respects your privacy and is committed to protecting the personal information you share with us as a member or visitor.`}
      effectiveDate="May 30, 2026"
      sections={sections}
    />
  );
}
