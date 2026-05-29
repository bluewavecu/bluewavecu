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
import type { BankingProduct, FeatureCard } from "@/types/home";

export const stats = [
  { value: "24/7", label: "Digital access" },
  { value: "Fast", label: "Payment movement" },
  { value: "Secure", label: "Account controls" },
  { value: "Mobile", label: "First experience" },
];

export const safetyHighlights = [
  "Account alerts",
  "Card controls",
  "Secure sign-in",
];

export const features: FeatureCard[] = [
  {
    title: "Secure Banking",
    description: "Modern account access patterns with privacy-minded digital flows.",
    icon: ShieldCheck,
  },
  {
    title: "Fast Transfers",
    description: "Move money with a streamlined experience built for daily use.",
    icon: Send,
  },
  {
    title: "Mobile Banking",
    description: "A responsive interface shaped for quick decisions on any screen.",
    icon: Smartphone,
  },
  {
    title: "Credit Solutions",
    description: "Clean pathways for credit cards, borrowing, and future loan tools.",
    icon: CreditCard,
  },
  {
    title: "Savings Accounts",
    description: "Organize balances, savings goals, and account activity with clarity.",
    icon: PiggyBank,
  },
  {
    title: "Fraud Monitoring",
    description: "Visible safety cues and alert-ready surfaces for sensitive actions.",
    icon: BellRing,
  },
];

export const products: BankingProduct[] = [
  {
    title: "Personal Banking",
    description: "Everyday checking, savings, transfers, and digital-first money management.",
    accent: "from-ocean-blue to-light-blue",
  },
  {
    title: "Business Banking",
    description: "Flexible account experiences for teams, vendors, payments, and cash flow.",
    accent: "from-royal-blue to-ocean-blue",
  },
  {
    title: "Lending",
    description: "A polished foundation for loan discovery, eligibility flows, and support.",
    accent: "from-primary-navy to-royal-blue",
  },
];

export const securityPoints = [
  {
    title: "Protected account access",
    description: "Security-forward navigation, safe calls to action, and clear user pathways.",
    icon: LockKeyhole,
  },
  {
    title: "Digital wallet ready",
    description: "A layout foundation that can grow into cards, payments, and transactions.",
    icon: Wallet,
  },
  {
    title: "Banking product clarity",
    description: "Product sections stay organized for future compliance and content review.",
    icon: Landmark,
  },
];
