export type AdminNavItem = {
  label: string;
  href: string;
  icon: string;
};

export type AdminNavSection = {
  title: string;
  items: AdminNavItem[];
};

export const adminNavSections: AdminNavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Command Center", href: "/admin", icon: "LayoutDashboard" },
      { label: "Operational Alerts", href: "/admin/alerts", icon: "BellRing" },
    ],
  },
  {
    title: "Members",
    items: [
      { label: "Users", href: "/admin/users", icon: "Users" },
      { label: "Accounts", href: "/admin/accounts", icon: "WalletCards" },
      { label: "Customer Profiles / KYC", href: "/admin/compliance", icon: "BadgeCheck" },
      { label: "Sessions / Security", href: "/admin/sessions", icon: "Shield" },
    ],
  },
  {
    title: "Money Movement",
    items: [
      { label: "Transactions", href: "/admin/transactions", icon: "ReceiptText" },
      { label: "Transfer Reviews", href: "/admin/transfer-reviews", icon: "ArrowLeftRight" },
      { label: "Bill Pay Reviews", href: "/admin/bill-pay", icon: "Receipt" },
      { label: "Adjustments", href: "/admin/adjustments", icon: "SlidersHorizontal" },
      { label: "Reconciliation", href: "/admin/reconciliation", icon: "Scale" },
    ],
  },
  {
    title: "Risk & Compliance",
    items: [
      { label: "Risk Monitoring", href: "/admin/risk", icon: "ShieldAlert" },
      { label: "Disputes", href: "/admin/disputes", icon: "Scale" },
      { label: "Compliance", href: "/admin/compliance", icon: "BadgeCheck" },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: "ClipboardList" },
      { label: "Event Logs", href: "/admin/event-logs", icon: "ListTree" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Support Tickets", href: "/admin/support", icon: "CircleHelp" },
      { label: "Jobs / Worker Queue", href: "/admin/jobs", icon: "Cog" },
      { label: "Finance Reports", href: "/admin/finance-reports", icon: "FileBarChart" },
      { label: "System Settings", href: "/admin/settings", icon: "Settings" },
    ],
  },
];

export const adminMobilePrimaryItems: AdminNavItem[] = [
  { label: "Command", href: "/admin", icon: "LayoutDashboard" },
  { label: "Users", href: "/admin/users", icon: "Users" },
  { label: "Transfers", href: "/admin/transfer-reviews", icon: "ArrowLeftRight" },
  { label: "Bill Pay", href: "/admin/bill-pay", icon: "Receipt" },
  { label: "Support", href: "/admin/support", icon: "CircleHelp" },
  { label: "More", href: "/admin/settings", icon: "Settings" },
];

export function isAdminNavActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  if (href === "/admin/transactions") {
    return pathname === "/admin/transactions";
  }

  if (href === "/admin/transfer-reviews") {
    return pathname.startsWith("/admin/transfer-reviews");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
