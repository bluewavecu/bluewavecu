export const userProfile = {
  name: "Avery Morgan",
  firstName: "Avery",
  email: "avery.morgan@example.com",
  phone: "(555) 014-2084",
  membershipId: "BW-1048-2257",
  avatarInitials: "AM",
};

export const accounts = [
  {
    id: "checking",
    type: "Checking",
    name: "Bluewave Everyday Checking",
    number: "**** 2841",
    balance: 18420.72,
    available: 17890.21,
    status: "Active",
    trend: "+4.8%",
    accent: "from-ocean-blue to-light-blue",
  },
  {
    id: "savings",
    type: "Savings",
    name: "High Tide Savings",
    number: "**** 6109",
    balance: 42110.5,
    available: 42110.5,
    status: "Growing",
    trend: "+7.1%",
    accent: "from-royal-blue to-ocean-blue",
  },
  {
    id: "credit-card",
    type: "Credit Card",
    name: "Bluewave Rewards Card",
    number: "**** 9256",
    balance: -1284.16,
    available: 8715.84,
    status: "Payment due Jun 12",
    trend: "15% used",
    accent: "from-primary-navy to-royal-blue",
  },
];

export const recentTransactions = [
  {
    id: "txn-1001",
    date: "May 28",
    merchant: "Northline Payroll",
    description: "Direct deposit",
    amount: 4800,
    type: "credit",
    status: "Posted",
    account: "Checking",
    category: "Income",
  },
  {
    id: "txn-1002",
    date: "May 27",
    merchant: "Apex Utilities",
    description: "Monthly electricity bill",
    amount: -164.82,
    type: "debit",
    status: "Posted",
    account: "Checking",
    category: "Bills",
  },
  {
    id: "txn-1003",
    date: "May 26",
    merchant: "Bluewave Transfer",
    description: "Savings contribution",
    amount: -750,
    type: "transfer",
    status: "Completed",
    account: "Checking",
    category: "Transfer",
  },
  {
    id: "txn-1004",
    date: "May 25",
    merchant: "Harbor Market",
    description: "Card purchase",
    amount: -89.43,
    type: "debit",
    status: "Posted",
    account: "Credit Card",
    category: "Groceries",
  },
  {
    id: "txn-1005",
    date: "May 24",
    merchant: "CloudDesk Software",
    description: "Business subscription",
    amount: -49,
    type: "debit",
    status: "Posted",
    account: "Credit Card",
    category: "Software",
  },
];

export const loanOffer = {
  title: "Personal loan preview",
  amount: "$25,000",
  rateLabel: "Rate placeholder",
  description:
    "Explore a prebuilt lending experience for future eligibility, document, and support workflows.",
};

export const supportMessages = [
  {
    id: "sup-1",
    title: "Card travel notice template",
    preview: "Prepare travel dates, destination, and preferred contact method.",
    status: "Open",
    priority: "Normal",
    date: "May 29",
  },
  {
    id: "sup-2",
    title: "Address update request",
    preview: "Profile change review queue placeholder for future verification.",
    status: "Pending",
    priority: "High",
    date: "May 27",
  },
  {
    id: "sup-3",
    title: "Wire transfer question",
    preview: "Support conversation shell ready for backend message history.",
    status: "Resolved",
    priority: "Normal",
    date: "May 23",
  },
];

export function formatCurrency(value: number) {
  const absoluteValue = Math.abs(value);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(absoluteValue);
}
