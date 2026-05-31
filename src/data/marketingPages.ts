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
    eyebrow: "Personal screens",
    title: "Personal workspace",
    headline: "Everyday account views designed for clarity",
    description:
      "Sample checking, savings, cards, and personal tools that show how daily money screens could be organized.",
    heroImage: marketingImages.personalHero,
    heroImageAlt: "Person reviewing a digital interface on a laptop",
    primaryCta: { label: "Try the demo", href: "/auth/register" },
    secondaryCta: { label: "Demo sign-in", href: "/auth/login" },
    stats: [
      { value: "$0", label: "Sample fee labels" },
      { value: "24/7", label: "Demo access" },
      { value: "Same day", label: "Transfer UI samples" },
      { value: "Demo", label: "Fictional data" },
    ],
    features: [
      {
        title: "Everyday views",
        description: "Sample direct deposit, bill pay, and debit card screens in one dashboard.",
        icon: Wallet,
      },
      {
        title: "Instant visibility",
        description: "Recent activity, pending transfers, and balance snapshots without clutter.",
        icon: LineChart,
      },
      {
        title: "Member transfers",
        description: "Move sample funds between demo accounts or schedule recurring UI flows with review steps.",
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
          "Bluewave organizes balances, cards, transfers, and support in predictable places so the demo stays easy to navigate.",
        bullets: [
          "Unified account overview with masked numbers",
          "Quick actions for transfers, bill pay, and support screens",
          "Statement export samples in CSV or PDF",
        ],
        image: marketingImages.personalSplit,
        imageAlt: "Person managing cards and everyday account screens online",
      },
    ],
  },
  business: {
    slug: "business",
    eyebrow: "Team screens",
    title: "Team workspace",
    headline: "Cash-flow views for teams that move quickly",
    description:
      "Business-style dashboards, vendor payments, and visibility features built as a UI reference—not live banking.",
    heroImage: marketingImages.businessHero,
    heroImageAlt: "Small team collaborating in an office",
    primaryCta: { label: "Ask about the demo", href: "/contact?topic=business" },
    secondaryCta: { label: "View sample rates", href: "/rates" },
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
          "Whether you are reviewing contractor payments or monthly activity samples, Bluewave keeps business screens structured and review-friendly.",
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
    eyebrow: "Savings UI",
    title: "Savings screens",
    headline: "Sample savings views with transparent layout",
    description:
      "Fictional high-yield savings screens, goal-friendly organization, and the same digital layout used across the demo.",
    heroImage: marketingImages.savingsHero,
    heroImageAlt: "Piggy bank representing savings growth in a lifestyle photo",
    primaryCta: { label: "View sample rates", href: "/rates" },
    secondaryCta: { label: "Try the demo", href: "/auth/register" },
    stats: [
      { value: "4.25%", label: "Sample savings APY*" },
      { value: "No min.", label: "Demo placeholder" },
      { value: "Monthly", label: "Interest UI sample" },
      { value: "Demo", label: "Not a real offer" },
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
          "Whether you are exploring an emergency-fund layout or a milestone tracker, Bluewave savings screens stay easy to monitor in the demo.",
        bullets: [
          "Interest accrual shown in sample statements",
          "Transfer between fictional Bluewave accounts",
          "No promotional footnotes on core demo tiers",
        ],
        image: marketingImages.savingsSplit,
        imageAlt: "Person saving toward a financial goal in a lifestyle photo",
      },
    ],
  },
  loans: {
    slug: "loans",
    eyebrow: "Lending UI",
    title: "Loan screens",
    headline: "Borrowing views with sample terms",
    description:
      "Auto, personal, and home lending pathways with placeholder rates, digital application samples, and fictional support flows.",
    heroImage: marketingImages.loansHero,
    heroImageAlt: "Keys on a table in a lifestyle photo",
    primaryCta: { label: "Explore loan screens", href: "/contact?topic=loans" },
    secondaryCta: { label: "Demo loan center", href: "/auth/loans" },
    stats: [
      { value: "6.49%", label: "Sample auto APR*" },
      { value: "Fixed", label: "UI rate labels" },
      { value: "Digital", label: "Application samples" },
      { value: "Demo", label: "Not a real offer" },
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
    title: "About",
    headline: "A digital experience built for exploration",
    description:
      "Bluewave is a demonstration project for member-portal design—not a licensed credit union or bank.",
    heroImage: marketingImages.aboutHero,
    heroImageAlt: "Bright modern office workspace",
    primaryCta: { label: "Contact the team", href: "/contact" },
    secondaryCta: { label: "View project notes", href: "/careers" },
    stats: [
      { value: "Demo", label: "Environment" },
      { value: "Sample", label: "Account data" },
      { value: "UI", label: "First focus" },
      { value: "Open", label: "For exploration" },
    ],
    features: [
      {
        title: "Demonstration only",
        description: "Every balance, rate, and product on this site is fictional sample data.",
        icon: Users,
      },
      {
        title: "Design reference",
        description: "Built to study transparent layouts and member-portal interaction patterns.",
        icon: Globe2,
      },
      {
        title: "Modern platform",
        description: "A continuously improving demo stack for accounts, payments, and security screens.",
        icon: Sparkles,
      },
      {
        title: "Security patterns",
        description: "Sample MFA, session controls, and review workflows for educational use.",
        icon: ShieldCheck,
      },
    ],
    splits: [
      {
        eyebrow: "Our purpose",
        title: "Make complex screens feel approachable",
        description:
          "We built Bluewave so teams can explore premium digital experiences without implying a real financial institution.",
        bullets: [
          "Transparent sample product information",
          "Human-readable support and contact paths",
          "Responsible demo flows with clear disclaimers",
        ],
        image: marketingImages.aboutSplit,
        imageAlt: "Team collaborating in a modern workspace",
      },
    ],
  },
};

export const rateRows: RateRow[] = [
  {
    product: "Sample Everyday Checking",
    apy: "0.05%",
    minBalance: "$0",
    notes: "Fictional demo tier; not a deposit offer",
  },
  {
    product: "Sample High Tide Savings",
    apy: "4.25%",
    minBalance: "$0",
    notes: "Placeholder APY for UI demonstration",
  },
  {
    product: "Sample Business Checking",
    apy: "0.10%",
    minBalance: "$500",
    notes: "Business screen reference data only",
  },
  {
    product: "Sample 12-Month Certificate",
    apy: "4.75%",
    minBalance: "$1,000",
    notes: "Fixed-term sample label for the demo",
  },
  {
    product: "Sample Auto Loan",
    apy: "6.49% APR",
    minBalance: "—",
    notes: "Starting APR placeholder; not an offer of credit",
  },
  {
    product: "Sample Personal Loan",
    apy: "9.99% APR",
    minBalance: "—",
    notes: "Fixed-rate sample label for demonstration",
  },
  {
    product: "Sample Home Equity Line",
    apy: "7.75% APR",
    minBalance: "—",
    notes: "Variable-rate placeholder for UI review",
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
  "Biometric sign-in and quick balance snapshots (demo)",
  "Card lock, transfer, and bill pay screen samples",
  "Push-ready alert UI for security and activity",
  "Support messaging with a sample profile attached",
];
