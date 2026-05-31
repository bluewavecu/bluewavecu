export const MEMBER_LOANS_PATH = "/member/loans";
export const MEMBER_SUPPORT_PATH = "/member/support";
export const MEMBER_SECURITY_PATH = "/member/security";

export type MemberNavItem = {
  label: string;
  href: string;
  icon: string;
};

export type MemberNavSection = {
  title: string;
  items: MemberNavItem[];
};

export const memberNavSections: MemberNavSection[] = [
  {
    title: "Overview",
    items: [{ label: "Overview", href: "/dashboard", icon: "LayoutDashboard" }],
  },
  {
    title: "Money",
    items: [
      { label: "Accounts", href: "/accounts", icon: "WalletCards" },
      { label: "Transactions", href: "/transactions", icon: "ReceiptText" },
      { label: "Transfers", href: "/transfers", icon: "ArrowLeftRight" },
      { label: "Bill Pay", href: "/bill-pay", icon: "Receipt" },
      { label: "Statements", href: "/statements", icon: "FileText" },
    ],
  },
  {
    title: "Products",
    items: [
      { label: "Cards", href: "/cards", icon: "CreditCard" },
      { label: "Loans", href: MEMBER_LOANS_PATH, icon: "Landmark" },
      { label: "Recipients", href: "/payees", icon: "Users" },
    ],
  },
  {
    title: "Service",
    items: [
      { label: "Disputes", href: "/disputes", icon: "Scale" },
      { label: "Support", href: MEMBER_SUPPORT_PATH, icon: "CircleHelp" },
      { label: "Notifications", href: "/notifications", icon: "Bell" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Profile & verification", href: "/profile", icon: "UserRound" },
      { label: "Security", href: MEMBER_SECURITY_PATH, icon: "Shield" },
      { label: "Settings", href: "/settings", icon: "Settings" },
    ],
  },
];

export const memberProtectedPaths = [
  "/dashboard",
  "/accounts",
  "/transactions",
  "/transfers",
  "/bill-pay",
  "/statements",
  "/payees",
  "/disputes",
  "/cards",
  MEMBER_LOANS_PATH,
  MEMBER_SUPPORT_PATH,
  "/notifications",
  "/profile",
  MEMBER_SECURITY_PATH,
  "/settings",
];

export function isMemberProtectedPath(pathname: string) {
  return memberProtectedPaths.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isMemberNavActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
