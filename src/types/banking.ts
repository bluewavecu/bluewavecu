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
  kycSummary: DashboardKycSummary;
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
  category?: "ACCOUNT" | "TRANSFER" | "BILL_PAY" | "CARD" | "LOAN" | "SECURITY" | "OTHER";
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

export type PayeeStatus = "ACTIVE" | "INACTIVE" | "DELETED";
export type BillPaymentStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "FAILED"
  | "CANCELLED"
  | "POSTED";

export type PayeeRecord = {
  id: string;
  name: string;
  nickname: string | null;
  category: string | null;
  maskedAccountNumber: string | null;
  routingNumber: string | null;
  address: string | null;
  phone: string | null;
  status: PayeeStatus;
  createdAt: string;
  updatedAt: string;
};

export type PayeesData = {
  payees: PayeeRecord[];
};

export type BillPaymentRecord = {
  id: string;
  fromAccountId: string;
  maskedAccountNumber: string;
  payeeId: string;
  payeeName: string;
  payeeCategory: string | null;
  amount: number;
  memo: string | null;
  dueDate: string | null;
  scheduledFor: string | null;
  status: BillPaymentStatus;
  transactionId: string | null;
  riskScore: number | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BillPaymentsData = {
  billPayments: BillPaymentRecord[];
};

export type AdminBillPaymentRecord = BillPaymentRecord & {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
};

export type AdminBillPaymentsData = {
  billPayments: AdminBillPaymentRecord[];
  summary: {
    pendingReview: number;
    total: number;
  };
};

export type JobStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";

export type JobRecord = {
  id: string;
  jobType: string;
  status: JobStatus;
  runAt: string;
  attempts: number;
  maxAttempts: number;
  payload: unknown;
  error: string | null;
  lockedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminJobsData = {
  jobs: JobRecord[];
  summary: {
    byStatus: Record<string, number>;
    total: number;
  };
};

export type WorkerRunSummary = {
  processed: number;
  completed: number;
  failed: number;
  results: Array<{
    jobId: string;
    jobType: string;
    status: "COMPLETED" | "FAILED";
    error?: string;
  }>;
};

export type ReconciliationAccountRecord = {
  accountId: string;
  accountNumber: string;
  accountType: string;
  userId: string;
  userName: string;
  accountBalance: number;
  ledgerBalance: number;
  delta: number;
  totalDebits: number;
  totalCredits: number;
  status: "MATCH" | "MISMATCH" | "NO_LEDGER";
};

export type ReconciliationSummary = {
  accounts: ReconciliationAccountRecord[];
  totals: {
    accountBalance: number;
    ledgerBalance: number;
    totalDebits: number;
    totalCredits: number;
    mismatchCount: number;
    accountCount: number;
  };
};

export type FinanceReportsData = {
  period: {
    from: string | null;
    to: string | null;
  };
  totals: {
    userBalances: number;
    ledgerDebits: number;
    ledgerCredits: number;
    pendingReviewAmount: number;
  };
  transactionsByStatus: Record<string, number>;
  billPaymentsByStatus: Record<string, number>;
  pendingReview: {
    transfers: number;
    billPayments: number;
    transferAmount: number;
    billPaymentAmount: number;
  };
  support: {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  };
  risk: {
    total: number;
    bySeverity: Record<string, number>;
    recentHighSeverity: number;
  };
};

export type LedgerDirection = "DEBIT" | "CREDIT";
export type AdjustmentStatus = "PENDING" | "APPROVED" | "REJECTED" | "POSTED";
export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED" | "CLOSED";
export type EventSeverity = "INFO" | "WARNING" | "ERROR" | "CRITICAL";

export type AdjustmentRecord = {
  id: string;
  accountId: string;
  userId: string;
  adminId: string;
  amount: number;
  direction: LedgerDirection;
  reason: string;
  status: AdjustmentStatus;
  reviewedAt: string | null;
  postedAt: string | null;
  reviewNote: string | null;
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
  accountNumber?: string;
  accountType?: AccountType;
  userName?: string;
  userEmail?: string;
};

export type AdjustmentsData = {
  adjustments: AdjustmentRecord[];
  summary: {
    pending: number;
    approved: number;
    total: number;
  };
};

export type DisputeRecord = {
  id: string;
  userId: string;
  transactionId: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
  transaction?: {
    reference: string;
    amount: number;
    description: string;
    merchant: string | null;
    status: string;
  };
  userName?: string;
  userEmail?: string;
};

export type DisputesData = {
  disputes: DisputeRecord[];
};

export type AdminDisputesData = {
  disputes: DisputeRecord[];
  summary: {
    open: number;
    underReview: number;
    total: number;
  };
};

export type EventLogRecord = {
  id: string;
  eventType: string;
  actorId: string | null;
  entityType: string;
  entityId: string | null;
  severity: EventSeverity;
  message: string;
  metadata: unknown;
  createdAt: string;
};

export type EventLogsData = {
  events: EventLogRecord[];
  summary: {
    total: number;
    bySeverity: Record<string, number>;
  };
};

export type KycStatus =
  | "NOT_STARTED"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "REJECTED";

export type CustomerProfileRecord = {
  id: string;
  userId: string;
  dateOfBirth: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  employmentStatus: string | null;
  annualIncome: number | null;
  kycStatus: KycStatus;
  kycSubmittedAt: string | null;
  kycReviewedAt: string | null;
  kycReviewedBy: string | null;
  kycReviewNote: string | null;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
};

export type ProfileData = {
  profile: CustomerProfileRecord;
};

export type AdminComplianceData = {
  profiles: CustomerProfileRecord[];
  summary: {
    notStarted: number;
    submitted: number;
    underReview: number;
    verified: number;
    rejected: number;
    total: number;
  };
};

export type DashboardKycSummary = {
  kycStatus: KycStatus;
  needsProfileCompletion: boolean;
};

export type MemberSummary = {
  totalAvailableBalance: number;
  pendingTransferCount: number;
  pendingBillPaymentCount: number;
  openDisputeCount: number;
  unreadNotificationCount: number;
  openSupportTicketCount: number;
  kycStatus: KycStatus;
  needsProfileCompletion: boolean;
  activeSessionCount: number;
};

export type CardActionResult = {
  cardId: string;
  action: string;
  status: "REQUEST_SUBMITTED";
  ticketId?: string;
  message: string;
};

export type LoanApplyResult = {
  ticketId: string;
  message: string;
};
