import {
  BellRing,
  CreditCard,
  Landmark,
  LockKeyhole,
  PiggyBank,
  Send,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import type { BankingProduct, FeatureCard, HomeHeritageBlock, HomeTestimonial } from "@/types/home";

export const stats = [
  { value: "24/7", label: "Demo access" },
  { value: "Fast", label: "Sample workflows" },
  { value: "Secure", label: "Auth patterns" },
  { value: "Mobile", label: "Responsive layout" },
];

export const safetyHighlights = [
  "Session alerts",
  "Card UI controls",
  "Secure sign-in flow",
];

export const features: FeatureCard[] = [
  {
    title: "Access controls",
    description: "Sample sign-in, alerts, and security settings that show how a member portal could behave.",
    icon: ShieldCheck,
  },
  {
    title: "Transfer screens",
    description: "Move sample funds between demo accounts with review steps before anything posts.",
    icon: Send,
  },
  {
    title: "Mobile layout",
    description: "Explore accounts, cards, and payment views on any screen size.",
    icon: Smartphone,
  },
  {
    title: "Card views",
    description: "Debit, credit, and card-management screens with realistic placeholder data.",
    icon: CreditCard,
  },
  {
    title: "Savings views",
    description: "Sample balances, goals, and activity history in a clean dashboard layout.",
    icon: PiggyBank,
  },
  {
    title: "Risk alerts",
    description: "Demo alerts, session controls, and dispute flows for unusual-looking activity.",
    icon: BellRing,
  },
];

export const homeImages = {
  hero: "/images/marketing/home-hero.webp",
  heritage: "/images/marketing/home-hall.webp",
  security: "/images/marketing/home-vault.webp",
} as const;

export const heritageBlock: HomeHeritageBlock = {
  image: homeImages.heritage,
  imageAlt: "Workspace with notebooks, forms, and interface planning materials",
};

export const products: BankingProduct[] = [
  {
    title: "Personal workspace",
    description: "Everyday account screens, transfers, bill-pay UI, and digital statement samples.",
    accent: "from-primary-navy via-royal-blue to-ocean-blue",
    image: "/images/marketing/home-personal.jpg",
    imageAlt: "Person reviewing a digital interface on a laptop",
  },
  {
    title: "Team workspace",
    description: "Business-style dashboards, team payments, vendor transfers, and cash-flow views.",
    accent: "from-brand-navy via-royal-blue to-ocean-blue",
    image: "/images/marketing/home-business.jpg",
    imageAlt: "Team collaborating around a table in a workspace",
  },
  {
    title: "Lending screens",
    description: "Sample personal, auto, and home-loan application and status views.",
    accent: "from-primary-navy to-brand-navy",
    image: "/images/marketing/home-lending.jpg",
    imageAlt: "Couple reviewing keys outside a home in a lifestyle photo",
  },
];

export const securityPoints = [
  {
    title: "Protected demo access",
    description: "Session monitoring, secure cookies, and role-based views for members and staff.",
    icon: LockKeyhole,
  },
  {
    title: "Payment UI controls",
    description: "Lock cards, report lost cards, and review bill-pay screens before sample funds post.",
    icon: Wallet,
  },
  {
    title: "Review workflows",
    description: "Audit trails, compliance-style queues, and admin review screens with sample data.",
    icon: Landmark,
  },
];

export const testimonials: HomeTestimonial[] = [
  {
    id: "testimonial-1",
    name: "Olivia Carter",
    location: "Plano, TX",
    quote:
      "The dashboard feels calm, polished, and easy to scan when I want a quick view of the layout.",
  },
  {
    id: "testimonial-2",
    name: "Marcus Bennett",
    location: "Irving, TX",
    quote:
      "Transfer and product screens are grouped clearly, which makes the demo easy to walk through.",
  },
  {
    id: "testimonial-3",
    name: "Sophia Mitchell",
    location: "Richardson, TX",
    quote:
      "Account summaries, quick actions, and recent activity are grouped in a way that feels practical.",
  },
  {
    id: "testimonial-4",
    name: "Daniel Brooks",
    location: "Frisco, TX",
    quote:
      "The layout has a premium feel without crowding the page—good reference for a digital product.",
  },
  {
    id: "testimonial-5",
    name: "Grace Thompson",
    location: "McKinney, TX",
    quote:
      "Bluewave's visual style feels trustworthy and current, especially on a phone screen.",
  },
  {
    id: "testimonial-6",
    name: "Ethan Parker",
    location: "Garland, TX",
    quote:
      "The interface makes it simple to understand where cards, transfers, and support screens live.",
  },
];
