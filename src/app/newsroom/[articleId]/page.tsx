import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { MarketingCtaBand } from "@/components/marketing/MarketingCtaBand";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MotionReveal } from "@/components/home/MotionReveal";
import { newsArticles } from "@/data/marketingPages";

type NewsArticlePageProps = {
  params: Promise<{ articleId: string }>;
};

export function generateStaticParams() {
  return newsArticles.map((article) => ({ articleId: article.id }));
}

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  const { articleId } = await params;
  const article = newsArticles.find((item) => item.id === articleId);

  if (!article) {
    return { title: "Article | Bluewave Credit Union" };
  }

  return {
    title: `${article.title} | Bluewave Credit Union`,
    description: article.summary,
  };
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { articleId } = await params;
  const article = newsArticles.find((item) => item.id === articleId);

  if (!article) {
    notFound();
  }

  return (
    <MarketingShell>
      <section className="classic-marble border-b border-classic-gold/20 py-16 sm:py-20">
        <div className="section-shell max-w-3xl">
          <MotionReveal>
            <Link
              href="/newsroom"
              className="inline-flex items-center gap-2 text-sm font-semibold text-royal-blue hover:text-ocean-blue"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back to newsroom
            </Link>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="rounded-sm border border-classic-gold/30 bg-white/70 px-3 py-1 text-xs font-semibold text-primary-navy">
                {article.category}
              </span>
              <span className="text-xs text-bluewave-gray">
                {new Date(article.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                · {article.readMinutes} min read
              </span>
            </div>
            <h1 className="font-display mt-5 text-4xl font-semibold text-primary-navy">{article.title}</h1>
            <div className="gold-rule mt-6 max-w-xs" aria-hidden="true" />
            <p className="mt-6 text-lg leading-8 text-bluewave-gray">{article.summary}</p>
          </MotionReveal>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <div className="section-shell max-w-3xl">
          <div className="space-y-4">
            {article.body.map((paragraph) => (
              <MotionReveal key={paragraph}>
                <p className="text-base leading-7 text-bluewave-gray">{paragraph}</p>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <MarketingCtaBand />
    </MarketingShell>
  );
}
