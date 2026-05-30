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
export type NotificationType =
  | "SYSTEM"
  | "TRANSFER"
  | "ACCOUNT"
  | "SECURITY"
  | "SUPPORT"
  | "ADMIN";

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
  sessionId?: string;
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

export type PageAccount = {
  id: string;
  accountType: AccountType;
  displayName: string;
  maskedAccountNumber: string;
  accountNumberLast4: string;
  routingNumber: string;
  balance: number;
  availableBalance: number;
  currency: string;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
};

export type AccountsData = {
  accounts: PageAccount[];
};

export type PageTransaction = {
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
  postedAt?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  ledgerSummary?: {
    entryCount: number;
    posted: boolean;
  };
};

export type TransactionsData = {
  transactions: PageTransaction[];
};

export type LinkedAccountSummary = {
  id: string;
  accountType: AccountType;
  displayName: string;
  maskedAccountNumber: string;
};

export type PageCard = {
  id: string;
  accountId: string;
  cardType: CardType;
  last4: string;
  cardholderName: string;
  status: CardStatus;
  spendingLimit: number;
  linkedAccount: LinkedAccountSummary;
  createdAt: string;
  updatedAt: string;
};

export type CardsData = {
  cards: PageCard[];
};

export type PageLoan = DashboardLoan;

export type LoanOffer = {
  id: string;
  title: string;
  description: string;
  preApprovedAmount: number;
  rateRange: string;
  termMonths: number;
  disclaimer: string;
};

export type LoansData = {
  loans: PageLoan[];
  offers: LoanOffer[];
};

export type PageSupportTicket = DashboardSupportTicket;

export type SupportTicketsData = {
  tickets: PageSupportTicket[];
};

export type CreateSupportTicketInput = {
  subject: string;
  message: string;
  priority: SupportTicketPriority;
};

export type TransferRequestInput = {
  fromAccountId: string;
  toAccountNumber?: string;
  recipientName?: string;
  amount: number;
  memo?: string;
};

export type TransferData = {
  transaction: PageTransaction;
  message: string;
};

export type TransactionFilters = {
  accountId?: string;
  status?: TransactionStatus;
  type?: TransactionType;
  limit?: number;
};

export type AdminUserSummary = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminTransactionRecord = {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  merchant: string | null;
  reference: string;
  status: TransactionStatus;
  createdAt: string;
  postedAt?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  reviewNote?: string | null;
  destinationAccountNumber?: string | null;
  ledgerEntryCount?: number;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  account: {
    id: string;
    accountType: AccountType;
    maskedAccountNumber: string;
  };
};

export type AdminSupportTicketRecord = {
  id: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
};

export type AdminOverviewCounts = {
  users: number;
  activeUsers: number;
  pendingUsers: number;
  accounts: number;
  transactions: number;
  pendingTransfers: number;
  supportTickets: number;
};

export type AdminOverviewData = {
  counts: AdminOverviewCounts;
  recentUsers: AdminUserSummary[];
  recentTransactions: AdminTransactionRecord[];
  recentSupportTickets: AdminSupportTicketRecord[];
};

export type AdminUsersData = {
  users: AdminUserSummary[];
};

export type AdminUserFilters = {
  status?: UserStatus;
  role?: UserRole;
  search?: string;
};

export type AdminAccountRecord = {
  id: string;
  accountType: AccountType;
  displayName: string;
  maskedAccountNumber: string;
  balance: number;
  availableBalance: number;
  currency: string;
  status: AccountStatus;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    status: UserStatus;
  };
};

export type AdminAccountsData = {
  accounts: AdminAccountRecord[];
};

export type AdminTransactionsData = {
  transactions: AdminTransactionRecord[];
};

export type AdminTransactionFilters = {
  status?: TransactionStatus;
  type?: TransactionType;
};

export type AdminSupportData = {
  tickets: AdminSupportTicketRecord[];
};

export type AdminSupportFilters = {
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
};

export type AdminAuditLogRecord = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown> | null;
  createdAt: string;
  admin: {
    id: string;
    fullName: string;
    email: string;
  };
};

export type AdminAuditLogsData = {
  logs: AdminAuditLogRecord[];
};

export type NotificationRecord = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata: Record<string, string | number | boolean | null> | null;
  createdAt: string;
};

export type NotificationsData = {
  notifications: NotificationRecord[];
  unreadCount: number;
};

export type ActivityTimelineItem = {
  id: string;
  kind: "LEDGER" | "TRANSACTION" | "SUPPORT";
  title: string;
  description: string;
  status?: string;
  amount?: number;
  direction?: "DEBIT" | "CREDIT";
  balanceAfter?: number;
  maskedAccountNumber?: string;
  reference?: string;
  createdAt: string;
  href?: string;
};

export type ActivityTimelineData = {
  items: ActivityTimelineItem[];
};

export type AdminOperationalAlert = {
  id: string;
  type: NotificationType;
  severity: "info" | "warning";
  title: string;
  message: string;
  href: string;
  createdAt: string;
};

export type AdminOperationalAlertsData = {
  alerts: AdminOperationalAlert[];
};

export type ScheduledTransferFrequency = "ONE_TIME" | "WEEKLY" | "BIWEEKLY" | "MONTHLY";
export type ScheduledTransferStatus = "ACTIVE" | "PAUSED" | "CANCELLED" | "COMPLETED";
export type RiskSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type MfaMethod = "EMAIL" | "SMS" | "TOTP";

export type ScheduledTransferRecord = {
  id: string;
  fromAccountId: string;
  maskedAccountNumber: string;
  recipientName: string | null;
  destinationAccountNumber: string | null;
  amount: number;
  memo: string | null;
  frequency: ScheduledTransferFrequency;
  scheduledFor: string;
  nextRunAt: string;
  status: ScheduledTransferStatus;
  createdAt: string;
  updatedAt: string;
};

export type ScheduledTransfersData = {
  scheduledTransfers: ScheduledTransferRecord[];
};

export type UserSessionRecord = {
  id: string;
  deviceName: string;
  ipAddress: string;
  userAgent: string;
  location: string | null;
  isActive: boolean;
  isCurrent: boolean;
  lastSeenAt: string;
  createdAt: string;
  revokedAt: string | null;
};

export type UserSessionsData = {
  sessions: UserSessionRecord[];
};

export type MfaSettingRecord = {
  method: MfaMethod;
  isEnabled: boolean;
  verifiedAt: string | null;
};

export type MfaSettingsData = {
  settings: MfaSettingRecord[];
};

export type RiskEventRecord = {
  id: string;
  userId: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  eventType: string;
  riskScore: number;
  severity: RiskSeverity;
  reason: string;
  metadata: Record<string, string | number | boolean | null> | null;
  createdAt: string;
};

export type AdminRiskData = {
  events: RiskEventRecord[];
  summary: {
    total: number;
    highOrCritical: number;
  };
};
