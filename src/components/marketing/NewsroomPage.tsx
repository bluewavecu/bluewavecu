import Link from "next/link";
import { MarketingCtaBand } from "@/components/marketing/MarketingCtaBand";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MotionReveal } from "@/components/home/MotionReveal";
import { marketingImages, newsArticles } from "@/data/marketingPages";

export function NewsroomPage() {
  return (
    <MarketingShell>
      <MarketingHero
        eyebrow="Newsroom"
        headline="Updates from the Bluewave demo project"
        description="Product notes, interface releases, and security improvements for the demonstration environment."
        heroImage={marketingImages.newsroomHero}
        heroImageAlt="News and updates on a desk"
        primaryCta={{ label: "Contact media team", href: "/contact?topic=newsroom" }}
        secondaryCta={{ label: "About Bluewave", href: "/about" }}
      />

      <section className="bg-background py-16 sm:py-20">
        <div className="section-shell grid gap-5 lg:grid-cols-2">
          {newsArticles.map((article, index) => (
            <MotionReveal key={article.id} delay={index * 0.04} className="marketing-card">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-sm border border-classic-gold/30 bg-classic-gold-muted/40 px-3 py-1 text-xs font-semibold text-primary-navy">
                  {article.category}
                </span>
                <span className="text-xs text-bluewave-gray">
                  {new Date(article.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  · {article.readMinutes} min read
                </span>
              </div>
              <h2 className="font-display mt-5 text-xl font-semibold text-primary-navy">
                <Link href={`/newsroom/${article.id}`} className="hover:text-royal-blue">
                  {article.title}
                </Link>
              </h2>
              <p className="mt-3 text-sm leading-6 text-bluewave-gray">{article.summary}</p>
              <Link
                href={`/newsroom/${article.id}`}
                className="mt-4 inline-flex text-sm font-semibold text-royal-blue hover:text-ocean-blue"
              >
                Read article
              </Link>
            </MotionReveal>
          ))}
        </div>
      </section>

      <MarketingCtaBand />
    </MarketingShell>
  );
}
