import type { LucideIcon } from "lucide-react";

export type FeatureCard = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type BankingProduct = {
  title: string;
  description: string;
  accent: string;
};

export type HomeTestimonial = {
  id: string;
  name: string;
  location: string;
  quote: string;
};
