import {
  ArrowLeftRight,
  BadgeCheck,
  Briefcase,
  Building2,
  Calculator,
  CreditCard,
  Globe2,
  HandCoins,
  Headphones,
  LineChart,
  LockKeyhole,
  PiggyBank,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { INSTITUTION } from "@/lib/institution";
import type {
  FaqItem,
  JobListing,
  MarketingPageConfig,
  NewsArticle,
  RateRow,
} from "@/types/marketing";

export const marketingImages = {
  personalHero: "/images/marketing/personal-hero.webp",
  personalSplit: "/images/marketing/personal-split.webp",
  businessHero: "/images/marketing/business-hero.webp",
  businessSplit: "/images/marketing/business-split.webp",
  savingsHero: "/images/marketing/savings-hero.webp",
  savingsSplit: "/images/marketing/savings-split.webp",
  loansHero: "/images/marketing/loans-hero.webp",
  loansSplit: "/images/marketing/loans-split.webp",
  supportHero: "/images/marketing/support-hero.webp",
  supportSplit: "/images/marketing/support-split.webp",
  securityHero: "/images/marketing/security-hero.webp",
  securitySplit: "/images/marketing/security-split.webp",
  mobileHero: "/images/marketing/mobile-hero.webp",
  ratesHero: "/images/marketing/rates-hero.webp",
  aboutHero: "/images/marketing/about-hero.webp",
  aboutSplit: "/images/marketing/about-split.webp",
  careersHero: "/images/marketing/careers-hero.webp",
  newsroomHero: "/images/marketing/newsroom-hero.webp",
  contactHero: "/images/marketing/contact-hero.webp",
} as const;

export const marketingPages: Record<string, MarketingPageConfig> = {
  personal: {
    slug: "personal",
    eyebrow: "Personal banking",
    title: "Personal Banking",
    headline: "Everyday accounts designed for modern life",
    description:
      "Checking, savings, digital cards, and member-first tools that keep daily money management clear, secure, and mobile-ready.",
    heroImage: marketingImages.personalHero,
    heroImageAlt: "Member reviewing finances on a laptop at home",
    primaryCta: { label: "Open an account", href: "/auth/register" },
    secondaryCta: { label: "Online banking", href: "/auth/login" },
    stats: [
      { value: "$0", label: "Everyday checking fees" },
      { value: "24/7", label: "Digital access" },
      { value: "Same day", label: "Transfer scheduling" },
      { value: "NCUA", label: "Insured deposits" },
    ],
    features: [
      {
        title: "Everyday Checking",
        description: "Direct deposit, bill pay, and debit card controls in one dashboard.",
        icon: Wallet,
      },
      {
        title: "Instant visibility",
        description: "Recent activity, pending transfers, and balance snapshots without clutter.",
        icon: LineChart,
      },
      {
        title: "Member transfers",
        description: "Move money between accounts or schedule recurring payments with review safeguards.",
        icon: ArrowLeftRight,
      },
      {
        title: "Card controls",
        description: "Lock cards, review limits, and monitor spending from web or mobile.",
        icon: CreditCard,
      },
      {
        title: "Support when needed",
        description: "Message the member support team or browse help resources anytime.",
        icon: Headphones,
      },
      {
        title: "Security built in",
        description: "Session monitoring, MFA options, and fraud-aware workflows for sensitive actions.",
        icon: ShieldCheck,
      },
    ],
    splits: [
      {
        eyebrow: "Designed for clarity",
        title: "A dashboard that respects your time",
        description:
          "Bluewave organizes balances, cards, transfers, and support in predictable places so routine banking stays fast.",
        bullets: [
          "Unified account overview with masked numbers",
          "Quick actions for transfers, bill pay, and support",
          "Statement exports in CSV or PDF",
        ],
        image: marketingImages.personalSplit,
        imageAlt: "Member managing cards and everyday banking online",
      },
    ],
  },
  business: {
    slug: "business",
    eyebrow: "Business banking",
    title: "Business Banking",
    headline: "Cash flow tools for teams that move quickly",
    description:
      "Business checking, vendor payments, and visibility features shaped for operators who need reliable digital banking without friction.",
    heroImage: marketingImages.businessHero,
    heroImageAlt: "Small business team collaborating in an office",
    primaryCta: { label: "Talk to business banking", href: "/contact?topic=business" },
    secondaryCta: { label: "View rates", href: "/rates" },
    stats: [
      { value: "Multi-user", label: "Team-ready workflows" },
      { value: "Bill pay", label: "Vendor payment support" },
      { value: "Audit-ready", label: "Activity history" },
      { value: "Dedicated", label: "Relationship support" },
    ],
    features: [
      {
        title: "Business checking",
        description: "Separate operating balances with clear activity timelines and export options.",
        icon: Building2,
      },
      {
        title: "Vendor payments",
        description: "Payees, scheduled payments, and review queues for higher-risk outflows.",
        icon: Briefcase,
      },
      {
        title: "Cash flow visibility",
        description: "Track inflows, pending items, and recent ledger activity from one console.",
        icon: LineChart,
      },
      {
        title: "Team permissions",
        description: "Foundation for role-based access as your organization scales digitally.",
        icon: Users,
      },
      {
        title: "Fraud monitoring",
        description: "Risk scoring on transfers and bill payments with operations review when needed.",
        icon: ShieldCheck,
      },
      {
        title: "Relationship support",
        description: "Connect with Bluewave specialists for onboarding and product questions.",
        icon: Headphones,
      },
    ],
    splits: [
      {
        eyebrow: "Built for operators",
        title: "Payments and reporting in one rhythm",
        description:
          "Whether you are paying contractors or reconciling monthly activity, Bluewave keeps business banking structured and review-friendly.",
        bullets: [
          "Bill pay with payee management",
          "Finance reports for operations teams",
          "Reconciliation views for balance confidence",
        ],
        image: marketingImages.businessSplit,
        imageAlt: "Business team reviewing financial analytics on screen",
        reverse: true,
      },
    ],
  },
  savings: {
    slug: "savings",
    eyebrow: "Savings",
    title: "Savings Accounts",
    headline: "Grow balances with transparent savings tools",
    description:
      "High-yield savings options, goal-friendly organization, and the same digital experience members expect from everyday checking.",
    heroImage: marketingImages.savingsHero,
    heroImageAlt: "Piggy bank representing steady savings growth",
    primaryCta: { label: "Compare rates", href: "/rates" },
    secondaryCta: { label: "Open savings", href: "/auth/register" },
    stats: [
      { value: "4.25%", label: "High Tide Savings APY*" },
      { value: "No min.", label: "To open online" },
      { value: "Monthly", label: "Interest posting" },
      { value: "Insured", label: "NCUA protection" },
    ],
    features: [
      {
        title: "High Tide Savings",
        description: "Competitive APY with a clean digital view of earned interest over time.",
        icon: PiggyBank,
      },
      {
        title: "Automatic transfers",
        description: "Schedule recurring moves from checking to keep savings consistent.",
        icon: ArrowLeftRight,
      },
      {
        title: "Goal-friendly views",
        description: "Track progress with balances, available funds, and recent activity.",
        icon: BadgeCheck,
      },
      {
        title: "Transparent rates",
        description: "Published APY tiers with no teaser language buried in fine print.",
        icon: Calculator,
      },
      {
        title: "Secure access",
        description: "Same authentication, session, and alert tools as the rest of Bluewave.",
        icon: LockKeyhole,
      },
      {
        title: "Member support",
        description: "Questions about dividends or transfers? Support is one click away.",
        icon: Headphones,
      },
    ],
    splits: [
      {
        eyebrow: "Save with confidence",
        title: "Simple savings that fits your plan",
        description:
          "Whether you are building an emergency fund or saving for a milestone, Bluewave savings accounts stay easy to monitor and manage online.",
        bullets: [
          "Interest accrual shown in statements",
          "Transfer between your Bluewave accounts",
          "No confusing promotional footnotes on core tiers",
        ],
        image: marketingImages.savingsSplit,
        imageAlt: "Member depositing cash savings toward a financial goal",
      },
    ],
  },
  loans: {
    slug: "loans",
    eyebrow: "Lending",
    title: "Loans & Lending",
    headline: "Borrowing options with a member-first process",
    description:
      "Auto, personal, and home lending pathways with clear rates, digital application foundations, and support from Bluewave specialists.",
    heroImage: marketingImages.loansHero,
    heroImageAlt: "Keys on a table representing a new home purchase",
    primaryCta: { label: "Check loan options", href: "/contact?topic=loans" },
    secondaryCta: { label: "Member loan center", href: "/auth/loans" },
    stats: [
      { value: "6.49%", label: "Auto loans from APR*" },
      { value: "Fixed", label: "Rate options" },
      { value: "Digital", label: "Application intake" },
      { value: "Local", label: "Member support" },
    ],
    features: [
      {
        title: "Auto loans",
        description: "Competitive terms for new and used vehicles with straightforward payment views.",
        icon: HandCoins,
      },
      {
        title: "Personal loans",
        description: "Consolidation and life-event borrowing with fixed payment clarity.",
        icon: Wallet,
      },
      {
        title: "Home lending",
        description: "Purchase and refinance pathways with relationship-led guidance.",
        icon: Building2,
      },
      {
        title: "Transparent rates",
        description: "Published starting APRs and example payments before you apply.",
        icon: Calculator,
      },
      {
        title: "Member loan center",
        description: "Signed-in members can review balances, payments, and loan status online.",
        icon: LineChart,
      },
      {
        title: "Support team",
        description: "Talk with lending specialists about eligibility and next steps.",
        icon: Headphones,
      },
    ],
    splits: [
      {
        eyebrow: "Borrow with clarity",
        title: "Lending that explains the numbers upfront",
        description:
          "Bluewave lending pages and member tools focus on readable terms, payment expectations, and human support when decisions matter.",
        bullets: [
          "Rate disclosures with example scenarios",
          "Online status tracking for members",
          "Support for documentation and next steps",
        ],
        image: marketingImages.loansSplit,
        imageAlt: "New homeowners with keys after loan approval",
        reverse: true,
      },
    ],
  },
  about: {
    slug: "about",
    eyebrow: "About Bluewave",
    title: "About Us",
    headline: "A credit union built for digital-first members",
    description:
      "Bluewave Credit Union combines NCUA-insured stability with a product experience shaped for modern banking expectations.",
    heroImage: marketingImages.aboutHero,
    heroImageAlt: "Bright modern office workspace",
    primaryCta: { label: "Meet our team", href: "/contact" },
    secondaryCta: { label: "View careers", href: "/careers" },
    stats: [
      { value: "2012", label: "Founded" },
      { value: "48k+", label: "Members served" },
      { value: "NCUA", label: "Federally insured" },
      { value: "Digital", label: "First experience" },
    ],
    features: [
      {
        title: "Member-owned",
        description: "Profits return to members through better rates, lower fees, and product investment.",
        icon: Users,
      },
      {
        title: "Community roots",
        description: "Founded to serve members with transparent banking and local relationship support.",
        icon: Globe2,
      },
      {
        title: "Modern platform",
        description: "A continuously improving digital stack for accounts, payments, and security.",
        icon: Sparkles,
      },
      {
        title: "Security commitment",
        description: "Fraud monitoring, MFA, session controls, and compliance-aware workflows.",
        icon: ShieldCheck,
      },
    ],
    splits: [
      {
        eyebrow: "Our mission",
        title: "Make secure banking feel effortless",
        description:
          "We believe members deserve premium digital experiences without sacrificing the trust and clarity expected from a credit union.",
        bullets: [
          "Transparent product information",
          "Human support when automation is not enough",
          "Responsible lending and review workflows",
        ],
        image: marketingImages.aboutSplit,
        imageAlt: "Bluewave team collaborating in a modern workspace",
      },
    ],
  },
};

export const rateRows: RateRow[] = [
  {
    product: "Bluewave Everyday Checking",
    apy: "0.05%",
    minBalance: "$0",
    notes: "No monthly maintenance fee with e-statements",
  },
  {
    product: "High Tide Savings",
    apy: "4.25%",
    minBalance: "$0",
    notes: "Competitive tier for everyday savers",
  },
  {
    product: "Business Checking",
    apy: "0.10%",
    minBalance: "$500",
    notes: "Designed for operating deposits and vendor payments",
  },
  {
    product: "12-Month Share Certificate",
    apy: "4.75%",
    minBalance: "$1,000",
    notes: "Fixed term; early withdrawal penalties may apply",
  },
  {
    product: "Auto Loan (new)",
    apy: "6.49% APR",
    minBalance: "—",
    notes: "Starting APR; rate varies by term and credit profile",
  },
  {
    product: "Personal Loan",
    apy: "9.99% APR",
    minBalance: "—",
    notes: "Fixed-rate option for qualified borrowers",
  },
  {
    product: "Home Equity Line",
    apy: "7.75% APR",
    minBalance: "—",
    notes: "Variable rate product; relationship review required",
  },
];

export const jobListings: JobListing[] = [
  {
    id: "job-1",
    title: "Member Experience Specialist",
    department: "Member Support",
    location: "Dallas, TX · Hybrid",
    type: "Full-time",
    summary: "Help members navigate accounts, transfers, and digital banking with clarity and empathy.",
  },
  {
    id: "job-2",
    title: "Commercial Banking Advisor",
    department: "Business Banking",
    location: "Dallas, TX",
    type: "Full-time",
    summary: "Guide business members through cash management, lending referrals, and onboarding.",
  },
  {
    id: "job-3",
    title: "Fraud & Risk Analyst",
    department: "Security",
    location: "Remote · US",
    type: "Full-time",
    summary: "Monitor risk events, tune alerts, and partner with operations on review workflows.",
  },
  {
    id: "job-4",
    title: "Frontend Engineer",
    department: "Digital",
    location: "Remote · US",
    type: "Full-time",
    summary: "Build accessible, premium member experiences across web and mobile surfaces.",
  },
];

export const newsArticles: NewsArticle[] = [
  {
    id: "news-1",
    category: "Product",
    title: "Bluewave launches PDF statements and profile verification workflow",
    summary: "Members can now export PDF statements and submit KYC profiles for faster reviews.",
    body: [
      "Bluewave members can download monthly statements in CSV or PDF format from the dashboard or Accounts page.",
      "Profile verification helps us review high-value transfers and bill payments faster while keeping accounts secure.",
      "Sign in to online banking to update your profile and submit verification documents when prompted.",
    ],
    date: "2026-05-30",
    readMinutes: 3,
  },
  {
    id: "news-2",
    category: "Security",
    title: "Expanded session controls and MFA options roll out to all members",
    summary: "New security settings make it easier to review devices and protect sensitive actions.",
    body: [
      "Review active sessions and revoke unfamiliar devices from the Security center.",
      "Optional email verification alerts add another layer of protection for sensitive sign-ins.",
      "Contact member services immediately if you notice activity you do not recognize.",
    ],
    date: "2026-05-12",
    readMinutes: 4,
  },
  {
    id: "news-3",
    category: "Community",
    title: "Bluewave sponsors financial wellness workshops across North Texas",
    summary: "Free community sessions cover budgeting, savings habits, and fraud awareness.",
    body: [
      "Bluewave is partnering with local nonprofits to host free financial wellness workshops this quarter.",
      "Sessions cover budgeting basics, building emergency savings, and spotting common fraud schemes.",
      "Members and future members can RSVP through the Contact page using the Community topic.",
    ],
    date: "2026-04-18",
    readMinutes: 2,
  },
  {
    id: "news-4",
    category: "Rates",
    title: "High Tide Savings APY increased to 4.25%",
    summary: "Members benefit from a stronger savings rate with the same digital account experience.",
    body: [
      "High Tide Share Savings now earns 4.25% APY on qualifying balances.",
      "Rates are subject to change; see the Rates page for current terms and membership eligibility.",
      "Existing share savings accounts receive the updated rate automatically—no action required.",
    ],
    date: "2026-03-30",
    readMinutes: 2,
  },
];

export const supportFaqs: FaqItem[] = [
  {
    question: "How do I reset my password or unlock my account?",
    answer:
      `Signed-in members can change their password under Settings. If you are locked out, contact member services at ${INSTITUTION.email} with your registered email and we will verify your identity before restoring access.`,
  },
  {
    question: "Where can I view pending transfers or bill payments?",
    answer:
      "Sign in and open Transfers or Bill Pay to review pending, scheduled, and recently completed activity. Admin-reviewed items show their current status clearly.",
  },
  {
    question: "How do I export account statements?",
    answer:
      "From the dashboard or Accounts area, use Export bank statement to download CSV or PDF files for a selected month and account.",
  },
  {
    question: "What should I do if I notice suspicious activity?",
    answer:
      "Sign in, review Security settings, revoke unfamiliar sessions, and contact support immediately. For card concerns, lock the card from the Cards page.",
  },
  {
    question: "How do I reach a person on the support team?",
    answer:
      `Use the Contact page, call ${INSTITUTION.phone.display}, or sign in and submit a ticket from the member Support center.`,
  },
];

export const securityHighlights = [
  {
    title: "Multi-factor authentication",
    description: "Optional MFA adds another layer for sign-in and sensitive account changes.",
    icon: LockKeyhole,
  },
  {
    title: "Session monitoring",
    description: "Review active devices, revoke sessions, and spot unfamiliar sign-in patterns.",
    icon: Smartphone,
  },
  {
    title: "Risk-aware transfers",
    description: "High-value or unusual activity may enter review before processing continues.",
    icon: ShieldCheck,
  },
  {
    title: "Encrypted connections",
    description: "Bluewave uses modern TLS practices for data in transit across member surfaces.",
    icon: Globe2,
  },
];

export const mobileAppFeatures = [
  "Biometric sign-in and quick balance snapshots",
  "Card lock, transfer, and bill pay shortcuts",
  "Push-ready alerts for security and account activity",
  "Support messaging with your member profile attached",
];
