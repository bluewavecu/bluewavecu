import Link from "next/link";
import { MarketingCtaBand } from "@/components/marketing/MarketingCtaBand";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { MarketingSectionHeader } from "@/components/marketing/MarketingSectionHeader";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MotionReveal } from "@/components/home/MotionReveal";
import { jobListings, marketingImages } from "@/data/marketingPages";

export function CareersPage() {
  return (
    <MarketingShell>
      <MarketingHero
        eyebrow="Careers"
        headline="Build thoughtful financial experiences with us"
        description="Join a team focused on secure digital banking, member support, and products that feel premium without being complicated."
        heroImage={marketingImages.careersHero}
        heroImageAlt="Team collaborating in a modern office"
        primaryCta={{ label: "View open roles", href: "#open-roles" }}
        secondaryCta={{ label: "Contact recruiting", href: "/contact?topic=careers" }}
      />

      <section id="open-roles" className="bg-background py-16 sm:py-20">
        <div className="section-shell">
          <MotionReveal>
            <MarketingSectionHeader eyebrow="Open roles" title="Current opportunities" />
          </MotionReveal>

          <div className="mt-8 grid gap-4">
            {jobListings.map((job, index) => (
              <MotionReveal key={job.id} delay={index * 0.04} className="marketing-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-primary-navy">{job.title}</h3>
                    <p className="mt-1 text-sm text-bluewave-gray">
                      {job.department} · {job.location} · {job.type}
                    </p>
                  </div>
                  <Link
                    href={`/contact?topic=careers&role=${encodeURIComponent(job.title)}`}
                    className="rounded-sm bg-ocean-blue px-4 py-2 text-sm font-semibold text-primary-navy"
                  >
                    Apply
                  </Link>
                </div>
                <p className="mt-4 text-sm leading-6 text-bluewave-gray">{job.summary}</p>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <MarketingCtaBand />
    </MarketingShell>
  );
}
