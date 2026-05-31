import { MEMBER_BASE_PATH } from "@/lib/authRoutes";

export const MEMBER_DASHBOARD_PATH = `${MEMBER_BASE_PATH}/dashboard`;
export const MEMBER_ACCOUNTS_PATH = `${MEMBER_BASE_PATH}/accounts`;
export const MEMBER_TRANSACTIONS_PATH = `${MEMBER_BASE_PATH}/transactions`;
export const MEMBER_TRANSFERS_PATH = `${MEMBER_BASE_PATH}/transfers`;
export const MEMBER_BILL_PAY_PATH = `${MEMBER_BASE_PATH}/bill-pay`;
export const MEMBER_STATEMENTS_PATH = `${MEMBER_BASE_PATH}/statements`;
export const MEMBER_PAYEES_PATH = `${MEMBER_BASE_PATH}/payees`;
export const MEMBER_DISPUTES_PATH = `${MEMBER_BASE_PATH}/disputes`;
export const MEMBER_CARDS_PATH = `${MEMBER_BASE_PATH}/cards`;
export const MEMBER_LOANS_PATH = `${MEMBER_BASE_PATH}/loans`;
export const MEMBER_SUPPORT_PATH = `${MEMBER_BASE_PATH}/support`;
export const MEMBER_NOTIFICATIONS_PATH = `${MEMBER_BASE_PATH}/notifications`;
export const MEMBER_PROFILE_PATH = `${MEMBER_BASE_PATH}/profile`;
export const MEMBER_SECURITY_PATH = `${MEMBER_BASE_PATH}/security`;
export const MEMBER_FORGOT_TRANSACTION_PIN_PATH = `${MEMBER_BASE_PATH}/forgot-transaction-pin`;
export const MEMBER_SETTINGS_PATH = `${MEMBER_BASE_PATH}/settings`;

export type MemberNavItem = {
  labelKey: string;
  href: string;
  icon: string;
};

export type MemberNavSection = {
  titleKey: string;
  items: MemberNavItem[];
};

export const memberNavSections: MemberNavSection[] = [
  {
    titleKey: "member.sections.overview",
    items: [{ labelKey: "member.nav.overview", href: MEMBER_DASHBOARD_PATH, icon: "LayoutDashboard" }],
  },
  {
    titleKey: "member.sections.money",
    items: [
      { labelKey: "member.nav.accounts", href: MEMBER_ACCOUNTS_PATH, icon: "WalletCards" },
      { labelKey: "member.nav.transactions", href: MEMBER_TRANSACTIONS_PATH, icon: "ReceiptText" },
      { labelKey: "member.nav.transfers", href: MEMBER_TRANSFERS_PATH, icon: "ArrowLeftRight" },
      { labelKey: "member.nav.billPay", href: MEMBER_BILL_PAY_PATH, icon: "Receipt" },
      { labelKey: "member.nav.statements", href: MEMBER_STATEMENTS_PATH, icon: "FileText" },
    ],
  },
  {
    titleKey: "member.sections.products",
    items: [
      { labelKey: "member.nav.cards", href: MEMBER_CARDS_PATH, icon: "CreditCard" },
      { labelKey: "member.nav.loans", href: MEMBER_LOANS_PATH, icon: "Landmark" },
      { labelKey: "member.nav.recipients", href: MEMBER_PAYEES_PATH, icon: "Users" },
    ],
  },
  {
    titleKey: "member.sections.service",
    items: [
      { labelKey: "member.nav.disputes", href: MEMBER_DISPUTES_PATH, icon: "Scale" },
      { labelKey: "member.nav.support", href: MEMBER_SUPPORT_PATH, icon: "CircleHelp" },
      { labelKey: "member.nav.notifications", href: MEMBER_NOTIFICATIONS_PATH, icon: "Bell" },
    ],
  },
  {
    titleKey: "member.sections.account",
    items: [
      { labelKey: "member.nav.profile", href: MEMBER_PROFILE_PATH, icon: "UserRound" },
      { labelKey: "member.nav.security", href: MEMBER_SECURITY_PATH, icon: "Shield" },
      { labelKey: "member.nav.settings", href: MEMBER_SETTINGS_PATH, icon: "Settings" },
    ],
  },
];

export const memberProtectedPaths = [
  MEMBER_DASHBOARD_PATH,
  MEMBER_ACCOUNTS_PATH,
  MEMBER_TRANSACTIONS_PATH,
  MEMBER_TRANSFERS_PATH,
  MEMBER_BILL_PAY_PATH,
  MEMBER_STATEMENTS_PATH,
  MEMBER_PAYEES_PATH,
  MEMBER_DISPUTES_PATH,
  MEMBER_CARDS_PATH,
  MEMBER_LOANS_PATH,
  MEMBER_SUPPORT_PATH,
  MEMBER_NOTIFICATIONS_PATH,
  MEMBER_PROFILE_PATH,
  MEMBER_SECURITY_PATH,
  MEMBER_FORGOT_TRANSACTION_PIN_PATH,
  MEMBER_SETTINGS_PATH,
];

export function isMemberProtectedPath(pathname: string) {
  return memberProtectedPaths.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isMemberNavActive(pathname: string, href: string) {
  if (href === MEMBER_DASHBOARD_PATH) {
    return pathname === MEMBER_DASHBOARD_PATH;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
