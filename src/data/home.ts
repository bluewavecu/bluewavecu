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
import type { BankingProduct, FeatureCard, HomeTestimonial } from "@/types/home";

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
    title: "Member Security",
    description: "Encrypted sign-in, account alerts, and member-controlled security settings.",
    icon: ShieldCheck,
  },
  {
    title: "Fast Transfers",
    description: "Move money between your accounts and to other members with review before posting.",
    icon: Send,
  },
  {
    title: "Mobile Banking",
    description: "Manage accounts, cards, and payments from any device with a responsive experience.",
    icon: Smartphone,
  },
  {
    title: "Credit Solutions",
    description: "Share draft debit cards, Visa credit, and member lending programs.",
    icon: CreditCard,
  },
  {
    title: "Share Savings",
    description: "Competitive savings rates with clear balances, goals, and activity history.",
    icon: PiggyBank,
  },
  {
    title: "Fraud Monitoring",
    description: "Risk alerts, session controls, and dispute support when something looks unusual.",
    icon: BellRing,
  },
];

export const products: BankingProduct[] = [
  {
    title: "Personal Banking",
    description: "Everyday share draft and share savings, transfers, bill pay, and digital statements.",
    accent: "from-ocean-blue to-light-blue",
  },
  {
    title: "Business Banking",
    description: "Business checking, team payments, vendor transfers, and cash-flow tools.",
    accent: "from-royal-blue to-ocean-blue",
  },
  {
    title: "Lending",
    description: "Personal, auto, and home equity lending with member-focused rates and service.",
    accent: "from-primary-navy to-royal-blue",
  },
];

export const securityPoints = [
  {
    title: "Protected account access",
    description: "Session monitoring, secure cookies, and role-based access for members and staff.",
    icon: LockKeyhole,
  },
  {
    title: "Card and payment controls",
    description: "Lock cards, report lost or stolen cards, and review bill pay before funds post.",
    icon: Wallet,
  },
  {
    title: "Regulatory readiness",
    description: "Audit trails, compliance review queues, and NCUA-insured member deposits.",
    icon: Landmark,
  },
];

export const testimonials: HomeTestimonial[] = [
  {
    id: "testimonial-1",
    name: "Olivia Carter",
    location: "Austin, TX",
    quote:
      "The dashboard feels calm, polished, and easy to scan when I want a quick view of my accounts.",
  },
  {
    id: "testimonial-2",
    name: "Marcus Bennett",
    location: "Charlotte, NC",
    quote:
      "Transfers and product details are presented clearly, which makes everyday banking feel less complicated.",
  },
  {
    id: "testimonial-3",
    name: "Emily Rodriguez",
    location: "Phoenix, AZ",
    quote:
      "I like how the Bluewave experience puts mobile banking and account visibility front and center.",
  },
  {
    id: "testimonial-4",
    name: "Daniel Brooks",
    location: "Denver, CO",
    quote:
      "The layout has the premium feel I expect from a modern credit union without making things feel crowded.",
  },
  {
    id: "testimonial-5",
    name: "Sophia Mitchell",
    location: "Tampa, FL",
    quote:
      "Account summaries, quick actions, and recent activity are grouped in a way that feels practical.",
  },
  {
    id: "testimonial-6",
    name: "Ethan Parker",
    location: "Seattle, WA",
    quote:
      "The interface makes it simple to understand where to go for cards, transfers, loans, and support.",
  },
  {
    id: "testimonial-7",
    name: "Grace Thompson",
    location: "Nashville, TN",
    quote:
      "Bluewave's visual style feels trustworthy and current, especially on a phone screen.",
  },
  {
    id: "testimonial-8",
    name: "Noah Sullivan",
    location: "Columbus, OH",
    quote:
      "The member dashboard gives me the kind of clean snapshot I want before making money decisions.",
  },
  {
    id: "testimonial-9",
    name: "Ava Coleman",
    location: "San Diego, CA",
    quote:
      "The banking pages feel organized, with enough detail to be useful and not so much that it slows me down.",
  },
  {
    id: "testimonial-10",
    name: "Caleb Foster",
    location: "Dallas, TX",
    quote:
      "I appreciate that security notices and support options are visible without being distracting.",
  },
  {
    id: "testimonial-11",
    name: "Mia Henderson",
    location: "Portland, OR",
    quote:
      "The design makes checking balances and looking through recent activity feel straightforward.",
  },
  {
    id: "testimonial-12",
    name: "Lucas Reed",
    location: "Raleigh, NC",
    quote:
      "The navigation is predictable, which matters when I am moving between accounts and payments.",
  },
  {
    id: "testimonial-13",
    name: "Chloe Ramirez",
    location: "San Antonio, TX",
    quote:
      "The mobile layout feels built for real daily use, not just a smaller version of a desktop page.",
  },
  {
    id: "testimonial-14",
    name: "Isaac Morgan",
    location: "Minneapolis, MN",
    quote:
      "The product cards make it easy to compare banking options without hunting through the page.",
  },
  {
    id: "testimonial-15",
    name: "Lily Anderson",
    location: "Salt Lake City, UT",
    quote:
      "I like the balance of polished visuals and practical account information throughout the experience.",
  },
  {
    id: "testimonial-16",
    name: "Benjamin Cox",
    location: "Chicago, IL",
    quote:
      "The dashboard gives a strong first impression for a credit union that wants to feel digital-first.",
  },
  {
    id: "testimonial-17",
    name: "Harper Collins",
    location: "Richmond, VA",
    quote:
      "The pages have enough structure to support serious banking tools as new features are added.",
  },
  {
    id: "testimonial-18",
    name: "Owen Russell",
    location: "Boise, ID",
    quote:
      "Quick actions and recent transactions are exactly where I expect them to be.",
  },
  {
    id: "testimonial-19",
    name: "Natalie Howard",
    location: "Orlando, FL",
    quote:
      "The lending team helped us refinance with a clear rate and straightforward online application.",
  },
  {
    id: "testimonial-20",
    name: "Jack Peterson",
    location: "Kansas City, MO",
    quote:
      "It feels easy to move from public product information into the member banking area.",
  },
  {
    id: "testimonial-21",
    name: "Ella Simmons",
    location: "Madison, WI",
    quote:
      "The clean spacing and blue palette make the experience feel focused and professional.",
  },
  {
    id: "testimonial-22",
    name: "Henry Price",
    location: "Atlanta, GA",
    quote:
      "Support, accounts, transfers, and statements are easy to find in online banking.",
  },
  {
    id: "testimonial-23",
    name: "Zoe Richardson",
    location: "Las Vegas, NV",
    quote:
      "The homepage communicates modern banking quickly, then gives clear ways to continue.",
  },
  {
    id: "testimonial-24",
    name: "Mason Griffin",
    location: "Pittsburgh, PA",
    quote:
      "The interface feels reliable because the navigation and account sections are consistent.",
  },
  {
    id: "testimonial-25",
    name: "Victoria Hughes",
    location: "Scottsdale, AZ",
    quote:
      "The card controls and security messaging make the digital banking experience feel thoughtful.",
  },
  {
    id: "testimonial-26",
    name: "Logan Bryant",
    location: "Omaha, NE",
    quote:
      "The layout makes routine banking tasks feel faster because the important actions are easy to find.",
  },
  {
    id: "testimonial-27",
    name: "Abigail Flores",
    location: "Sacramento, CA",
    quote:
      "The testimonials, CTA, and product sections work together without making the page feel busy.",
  },
  {
    id: "testimonial-28",
    name: "Samuel Murphy",
    location: "Louisville, KY",
    quote:
      "Online banking gives us one secure place to manage accounts, cards, and member services.",
  },
  {
    id: "testimonial-29",
    name: "Hannah Rivera",
    location: "Fort Worth, TX",
    quote:
      "I can quickly tell where to review accounts, make transfers, and get support.",
  },
  {
    id: "testimonial-30",
    name: "Carter Evans",
    location: "Boston, MA",
    quote:
      "Bluewave's digital experience feels modern while still keeping important banking information readable.",
  },
];
