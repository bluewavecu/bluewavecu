import { INSTITUTION } from "@/lib/institution";

export function InstitutionJsonLd() {
  const { address } = INSTITUTION;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreditUnion",
    name: INSTITUTION.legalName,
    url: INSTITUTION.website,
    logo: `${INSTITUTION.website}/images/logo.webp`,
    image: `${INSTITUTION.website}/images/auth_logo.webp`,
    telephone: INSTITUTION.phone.tel,
    email: INSTITUTION.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.line1,
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.postalCode,
      addressCountry: "US",
    },
    sameAs: [INSTITUTION.website, INSTITUTION.ncuaCreditUnionLocatorUrl],
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Texas",
    },
    description:
      "Member-owned credit union offering share draft, savings, lending, and secure online banking.",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
