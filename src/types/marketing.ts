import type { LucideIcon } from "lucide-react";

export type MarketingStat = {
  value: string;
  label: string;
};

export type MarketingFeature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type MarketingSplitBlock = {
  eyebrow: string;
  title: string;
  description: string;
  bullets?: string[];
  image: string;
  imageAlt: string;
  reverse?: boolean;
};

export type MarketingPageConfig = {
  slug: string;
  eyebrow: string;
  title: string;
  headline: string;
  description: string;
  heroImage: string;
  heroImageAlt: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  stats?: MarketingStat[];
  features?: MarketingFeature[];
  splits?: MarketingSplitBlock[];
};

export type RateRow = {
  product: string;
  apy: string;
  minBalance: string;
  notes: string;
};

export type JobListing = {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  summary: string;
};

export type NewsArticle = {
  id: string;
  category: string;
  title: string;
  summary: string;
  body: string[];
  date: string;
  readMinutes: number;
};

export type FaqItem = {
  question: string;
  answer: string;
};
