export type ApiResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

export type UserRole = "USER" | "ADMIN";
export type UserStatus = "PENDING" | "ACTIVE" | "SUSPENDED";
export type AccountType = "CHECKING" | "SAVINGS" | "CREDIT";
export type AccountStatus = "ACTIVE" | "FROZEN" | "CLOSED";
export type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "TRANSFER"
  | "PAYMENT"
  | "CARD"
  | "FEE"
  | "REFUND";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "REVERSED";
export type CardType = "DEBIT" | "CREDIT";
export type CardStatus = "ACTIVE" | "LOCKED" | "CANCELLED" | "EXPIRED";
export type LoanStatus = "PENDING" | "ACTIVE" | "PAID_OFF" | "DEFAULTED" | "DENIED";
export type SupportTicketStatus = "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";
export type SupportTicketPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type SafeUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthTokenPayload = {
  userId: string;
  role: UserRole;
};

export type AuthResponse = {
  user: SafeUser;
  token: string;
};

export type SerializedAccount = {
  id: string;
  userId: string;
  accountType: AccountType;
  accountNumber: string;
  routingNumber: string;
  balance: number;
  availableBalance: number;
  currency: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SerializedTransaction = {
  id: string;
  userId: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  description: string;
  merchant: string | null;
  reference: string;
  status: TransactionStatus;
  createdAt: Date;
};

export type DashboardUserProfile = {
  id: string;
  fullName: string;
  firstName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};

export type DashboardAccount = {
  id: string;
  accountType: AccountType;
  displayName: string;
  maskedAccountNumber: string;
  accountNumberLast4: string;
  balance: number;
  availableBalance: number;
  currency: string;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
};

export type DashboardTransaction = {
  id: string;
  accountId: string;
  accountType: AccountType;
  maskedAccountNumber: string;
  type: TransactionType;
  amount: number;
  description: string;
  merchant: string | null;
  reference: string;
  status: TransactionStatus;
  createdAt: string;
};

export type DashboardCard = {
  id: string;
  accountId: string;
  cardType: CardType;
  last4: string;
  cardholderName: string;
  status: CardStatus;
  spendingLimit: number;
  createdAt: string;
  updatedAt: string;
};

export type DashboardLoan = {
  id: string;
  loanType: string;
  principal: number;
  balance: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  status: LoanStatus;
  createdAt: string;
  updatedAt: string;
};

export type DashboardSupportTicket = {
  id: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  createdAt: string;
  updatedAt: string;
};

export type DashboardSupportTicketSummary = {
  total: number;
  open: number;
  pending: number;
  resolved: number;
  closed: number;
  urgent: number;
  recentTickets: DashboardSupportTicket[];
};

export type DashboardData = {
  user: DashboardUserProfile;
  accounts: DashboardAccount[];
  recentTransactions: DashboardTransaction[];
  cards: DashboardCard[];
  loans: DashboardLoan[];
  supportTicketSummary: DashboardSupportTicketSummary;
};
