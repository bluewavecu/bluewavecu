import { ADMIN_DASHBOARD_PATH, adminConsolePath } from "@/lib/authRoutes";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: string;
};

export type AdminNavSection = {
  title: string;
  items: AdminNavItem[];
};

export { ADMIN_DASHBOARD_PATH, adminConsolePath };

export const adminNavSections: AdminNavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Command Center", href: ADMIN_DASHBOARD_PATH, icon: "LayoutDashboard" },
      { label: "Operational Alerts", href: adminConsolePath("alerts"), icon: "BellRing" },
    ],
  },
  {
    title: "Members",
    items: [
      { label: "Users", href: adminConsolePath("users"), icon: "Users" },
      { label: "Accounts", href: adminConsolePath("accounts"), icon: "WalletCards" },
      { label: "Customer Profiles / KYC", href: adminConsolePath("compliance"), icon: "BadgeCheck" },
      { label: "ID Verifications", href: adminConsolePath("id-verifications"), icon: "IdCard" },
      { label: "Sessions / Security", href: adminConsolePath("sessions"), icon: "Shield" },
    ],
  },
  {
    title: "Money Movement",
    items: [
      { label: "Transactions", href: adminConsolePath("transactions"), icon: "ReceiptText" },
      { label: "Transfer Reviews", href: adminConsolePath("transfer-reviews"), icon: "ArrowLeftRight" },
      { label: "Bill Pay Reviews", href: adminConsolePath("bill-pay"), icon: "Receipt" },
      { label: "Card Applications", href: adminConsolePath("card-applications"), icon: "CreditCard" },
      { label: "Adjustments", href: adminConsolePath("adjustments"), icon: "SlidersHorizontal" },
      { label: "Generate Transactions", href: adminConsolePath("transaction-generator"), icon: "Sparkles" },
      { label: "Transfer Verification", href: adminConsolePath("transfer-verification"), icon: "KeyRound" },
      { label: "Reconciliation", href: adminConsolePath("reconciliation"), icon: "Scale" },
    ],
  },
  {
    title: "Risk & Compliance",
    items: [
      { label: "Risk Monitoring", href: adminConsolePath("risk"), icon: "ShieldAlert" },
      { label: "Disputes", href: adminConsolePath("disputes"), icon: "Scale" },
      { label: "Compliance", href: adminConsolePath("compliance"), icon: "BadgeCheck" },
      { label: "Audit Logs", href: adminConsolePath("audit-logs"), icon: "ClipboardList" },
      { label: "Event Logs", href: adminConsolePath("event-logs"), icon: "ListTree" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Support Tickets", href: adminConsolePath("support"), icon: "CircleHelp" },
      { label: "Jobs / Worker Queue", href: adminConsolePath("jobs"), icon: "Cog" },
      { label: "Finance Reports", href: adminConsolePath("finance-reports"), icon: "FileBarChart" },
      { label: "System Settings", href: adminConsolePath("settings"), icon: "Settings" },
      { label: "Change password", href: adminConsolePath("settings"), icon: "Shield" },
    ],
  },
];

export const adminMobilePrimaryItems: AdminNavItem[] = [
  { label: "Command", href: ADMIN_DASHBOARD_PATH, icon: "LayoutDashboard" },
  { label: "Users", href: adminConsolePath("users"), icon: "Users" },
  { label: "Transfers", href: adminConsolePath("transfer-reviews"), icon: "ArrowLeftRight" },
  { label: "Bill Pay", href: adminConsolePath("bill-pay"), icon: "Receipt" },
  { label: "Support", href: adminConsolePath("support"), icon: "CircleHelp" },
  { label: "More", href: adminConsolePath("settings"), icon: "Settings" },
];

export function isAdminNavActive(pathname: string, href: string) {
  if (href === ADMIN_DASHBOARD_PATH) {
    return pathname === ADMIN_DASHBOARD_PATH;
  }

  if (href === adminConsolePath("transactions")) {
    return pathname === adminConsolePath("transactions");
  }

  if (href === adminConsolePath("transfer-reviews")) {
    return pathname.startsWith(adminConsolePath("transfer-reviews"));
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
