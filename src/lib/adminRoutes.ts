import { ADMIN_DASHBOARD_PATH, adminConsolePath } from "@/lib/authRoutes";

export type AdminNavItem = {
  labelKey: string;
  href: string;
  icon: string;
};

export type AdminNavSection = {
  titleKey: string;
  items: AdminNavItem[];
};

export { ADMIN_DASHBOARD_PATH, adminConsolePath };

export const adminNavSections: AdminNavSection[] = [
  {
    titleKey: "admin.sections.overview",
    items: [
      { labelKey: "admin.nav.commandCenter", href: ADMIN_DASHBOARD_PATH, icon: "LayoutDashboard" },
      { labelKey: "admin.nav.operationalAlerts", href: adminConsolePath("alerts"), icon: "BellRing" },
    ],
  },
  {
    titleKey: "admin.sections.members",
    items: [
      { labelKey: "admin.nav.users", href: adminConsolePath("users"), icon: "Users" },
      { labelKey: "admin.nav.accounts", href: adminConsolePath("accounts"), icon: "WalletCards" },
      {
        labelKey: "admin.nav.customerProfilesKyc",
        href: adminConsolePath("compliance"),
        icon: "BadgeCheck",
      },
      { labelKey: "admin.nav.idVerifications", href: adminConsolePath("id-verifications"), icon: "IdCard" },
      { labelKey: "admin.nav.sessionsSecurity", href: adminConsolePath("sessions"), icon: "Shield" },
    ],
  },
  {
    titleKey: "admin.sections.moneyMovement",
    items: [
      { labelKey: "admin.nav.transactions", href: adminConsolePath("transactions"), icon: "ReceiptText" },
      {
        labelKey: "admin.nav.transferReviews",
        href: adminConsolePath("transfer-reviews"),
        icon: "ArrowLeftRight",
      },
      { labelKey: "admin.nav.billPayReviews", href: adminConsolePath("bill-pay"), icon: "Receipt" },
      { labelKey: "admin.nav.cardApplications", href: adminConsolePath("card-applications"), icon: "CreditCard" },
      { labelKey: "admin.nav.adjustments", href: adminConsolePath("adjustments"), icon: "SlidersHorizontal" },
      {
        labelKey: "admin.nav.generateTransactions",
        href: adminConsolePath("transaction-generator"),
        icon: "Sparkles",
      },
      {
        labelKey: "admin.nav.transferVerification",
        href: adminConsolePath("transfer-verification"),
        icon: "KeyRound",
      },
      { labelKey: "admin.nav.reconciliation", href: adminConsolePath("reconciliation"), icon: "Scale" },
    ],
  },
  {
    titleKey: "admin.sections.riskCompliance",
    items: [
      { labelKey: "admin.nav.riskMonitoring", href: adminConsolePath("risk"), icon: "ShieldAlert" },
      { labelKey: "admin.nav.disputes", href: adminConsolePath("disputes"), icon: "Scale" },
      { labelKey: "admin.nav.compliance", href: adminConsolePath("compliance"), icon: "BadgeCheck" },
      { labelKey: "admin.nav.auditLogs", href: adminConsolePath("audit-logs"), icon: "ClipboardList" },
      { labelKey: "admin.nav.eventLogs", href: adminConsolePath("event-logs"), icon: "ListTree" },
    ],
  },
  {
    titleKey: "admin.sections.operations",
    items: [
      { labelKey: "admin.nav.supportTickets", href: adminConsolePath("support"), icon: "CircleHelp" },
      { labelKey: "admin.nav.jobsWorkerQueue", href: adminConsolePath("jobs"), icon: "Cog" },
      { labelKey: "admin.nav.financeReports", href: adminConsolePath("finance-reports"), icon: "FileBarChart" },
      { labelKey: "admin.nav.systemSettings", href: adminConsolePath("settings"), icon: "Settings" },
      { labelKey: "admin.nav.changePassword", href: adminConsolePath("settings"), icon: "Shield" },
    ],
  },
];

export const adminMobilePrimaryItems: AdminNavItem[] = [
  { labelKey: "admin.nav.command", href: ADMIN_DASHBOARD_PATH, icon: "LayoutDashboard" },
  { labelKey: "admin.nav.users", href: adminConsolePath("users"), icon: "Users" },
  { labelKey: "admin.nav.transfers", href: adminConsolePath("transfer-reviews"), icon: "ArrowLeftRight" },
  { labelKey: "admin.nav.billPay", href: adminConsolePath("bill-pay"), icon: "Receipt" },
  { labelKey: "admin.nav.support", href: adminConsolePath("support"), icon: "CircleHelp" },
  { labelKey: "admin.nav.more", href: adminConsolePath("settings"), icon: "Settings" },
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
