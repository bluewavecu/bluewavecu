import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MarketingSectionHeader } from "@/components/marketing/MarketingSectionHeader";
import { MotionReveal } from "@/components/home/MotionReveal";
import { INSTITUTION, formatInstitutionAddress } from "@/lib/institution";

type LegalSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type LegalDocumentPageProps = {
  title: string;
  description: string;
  effectiveDate: string;
  sections: LegalSection[];
};

export function LegalDocumentPage({
  title,
  description,
  effectiveDate,
  sections,
}: LegalDocumentPageProps) {
  return (
    <MarketingShell>
      <section className="classic-marble border-b border-classic-gold/20 py-16 sm:py-20">
        <div className="section-shell max-w-3xl">
          <MotionReveal>
            <MarketingSectionHeader eyebrow="Legal" title={title} description={description} />
            <p className="mt-4 text-sm text-bluewave-gray">Effective {effectiveDate}</p>
          </MotionReveal>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <div className="section-shell max-w-3xl">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <MotionReveal key={section.title} delay={index * 0.03}>
                <article className="marketing-card">
                  <h2 className="font-display text-xl font-semibold text-primary-navy">{section.title}</h2>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-bluewave-gray">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    {section.bullets ? (
                      <ul className="list-disc space-y-2 pl-5">
                        {section.bullets.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </article>
              </MotionReveal>
            ))}
          </div>

          <p className="mt-10 text-sm leading-6 text-bluewave-gray">
            Questions about this policy? Contact {INSTITUTION.legalName} at{" "}
            <Link href={`mailto:${INSTITUTION.email}`} className="font-semibold text-royal-blue">
              {INSTITUTION.email}
            </Link>{" "}
            or{" "}
            <Link href={`tel:${INSTITUTION.phone.tel}`} className="font-semibold text-royal-blue">
              {INSTITUTION.phone.display}
            </Link>
            . Mailing address: {formatInstitutionAddress()}.
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
