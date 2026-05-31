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
export type UserStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "ON_HOLD" | "DISABLED";
export type AccountType =
  | "CHECKING"
  | "SAVINGS"
  | "BUSINESS"
  | "MONEY_MARKET"
  | "CERTIFICATE"
  | "CREDIT";
export type AccountStatus = "PENDING_APPROVAL" | "ACTIVE" | "FROZEN" | "CLOSED";
export type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "TRANSFER"
  | "PAYMENT"
  | "CARD"
  | "FEE"
  | "REFUND";

export type TransferOtpStepKey =
  | "IDENTITY_CHECK"
  | "AMOUNT_CONFIRMATION"
  | "BENEFICIARY_VERIFICATION"
  | "SECURITY_CLEARANCE"
  | "FINAL_RELEASE";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "REVERSED";
export type CardType = "DEBIT" | "CREDIT";
export type CardStatus = "ACTIVE" | "LOCKED" | "CANCELLED" | "EXPIRED";
export type CardApplicationStatus = "PENDING" | "APPROVED" | "DECLINED";

export type IdDocumentType = "DRIVERS_LICENSE" | "PASSPORT" | "STATE_ID" | "NATIONAL_ID";

export type IdVerificationStatus = "PENDING" | "APPROVED" | "REJECTED" | "DECLINED";
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
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  transactionsUnrestricted: boolean;
  hasTransactionPin: boolean;
  statusNote?: string | null;
  deletedAt?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthTokenPayload = {
  userId: string;
  role: UserRole;
  sessionId?: string;
};

export type AuthResponse =
  | {
      user: SafeUser;
      token: string;
      requiresOtp?: false;
    }
  | {
      requiresOtp: true;
      loginChallengeId: string;
      maskedEmail: string;
      message: string;
    };

export type RegisterResponse =
  | {
      user: SafeUser;
      token: string;
    }
  | {
      requiresEmailVerification: true;
      verificationChallengeId: string;
      username: string;
      maskedEmail: string;
      message: string;
    };

export type VerifyEmailResponse = {
  username: string;
  message: string;
};

export type ResendEmailVerificationResponse = {
  verificationChallengeId: string;
  username: string;
  maskedEmail: string;
  message: string;
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
  profilePhotoUrl: string | null;
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
  panPrefix: string;
  network: string;
  maskedPan: string;
  expiryMonth: number | null;
  expiryYear: number | null;
  expiryLabel: string | null;
  cardholderName: string;
  status: CardStatus;
  spendingLimit: number;
  linkedAccount: LinkedAccountSummary;
  createdAt: string;
  updatedAt: string;
};

export type CardApplicationRecord = {
  id: string;
  accountId: string;
  cardType: CardType;
  cardholderName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  formattedAddress: string;
  status: CardApplicationStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  cardId: string | null;
  linkedAccount?: {
    displayName: string;
    maskedAccountNumber: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type IdVerificationRecord = {
  id: string;
  userId: string;
  documentType: IdDocumentType;
  documentTypeLabel: string;
  frontPhotoUrl: string;
  backPhotoUrl: string | null;
  status: IdVerificationStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
};

export type IdVerificationData = {
  submissions: IdVerificationRecord[];
  canSubmit: boolean;
  pendingCount: number;
  latestStatus: IdVerificationStatus | null;
};

export type AdminIdVerificationRecord = IdVerificationRecord & {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
};

export type AdminIdVerificationsData = {
  submissions: AdminIdVerificationRecord[];
  summary: {
    pending: number;
    approved: number;
    rejected: number;
    declined: number;
    total: number;
  };
};

export type CardTransactionSummary = {
  id: string;
  amount: number;
  description: string;
  merchant: string | null;
  reference: string;
  status: TransactionStatus;
  createdAt: string;
  postedAt: string | null;
};

export type CardsData = {
  cards: PageCard[];
  applications: CardApplicationRecord[];
  accounts: LinkedAccountSummary[];
};

export type CardApplyResult = {
  application: CardApplicationRecord;
  message: string;
};

export type AdminCardApplicationRecord = CardApplicationRecord & {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
};

export type AdminCardApplicationsData = {
  applications: AdminCardApplicationRecord[];
  summary: {
    pending: number;
    total: number;
  };
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
  transferMethod: "DIRECT_DEPOSIT" | "ACH" | "WIRE";
  toAccountNumber?: string;
  recipientName?: string;
  amount: number;
  memo?: string;
  otpCode?: string;
  transactionPin?: string;
  stepOtpCodes?: Partial<Record<TransferOtpStepKey, string>>;
};

export type TransferOtpStepRequirement = {
  stepKey: TransferOtpStepKey;
  label: string;
  order: number;
};

export type TransferOtpRequestInput = Omit<
  TransferRequestInput,
  "otpCode" | "transactionPin" | "stepOtpCodes"
>;

export type TransferOtpData = {
  message: string;
  expiresAt: string;
  requiresTransactionPin: boolean;
  otpRequired: boolean;
  adminSteps: TransferOtpStepRequirement[];
  adminStepsRequired: boolean;
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
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  transactionsUnrestricted: boolean;
  hasTransactionPin: boolean;
  statusNote?: string | null;
  deletedAt?: string | null;
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
  delayedAt?: string | null;
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

export type AdminUserSummaryWithKyc = AdminUserSummary & {
  kycStatus?: KycStatus | null;
};

export type AdminUsersData = {
  users: AdminUserSummaryWithKyc[];
};

export type AdminCreateMemberResponse = {
  user: AdminUserSummaryWithKyc;
  message: string;
};

export type AdminUserFilters = {
  status?: UserStatus;
  role?: UserRole;
  search?: string;
  kycStatus?: KycStatus;
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
export type AdjustmentStatus = "PENDING" | "APPROVED" | "SCHEDULED" | "REJECTED" | "POSTED";
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
  effectiveAt: string;
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

export type MemberTransferOtpStepRecord = {
  stepKey: TransferOtpStepKey;
  label: string;
  description: string;
  order: number;
  enabled: boolean;
  code: string | null;
  updatedAt: string | null;
};

export type MemberTransferOtpStepsData = {
  userId: string;
  userName: string;
  steps: MemberTransferOtpStepRecord[];
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
  profilePhotoUrl: string | null;
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
  needsIdVerification: boolean;
  pendingIdVerificationCount: number;
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

export type AdminCommandCenterMetrics = {
  totalMembers: number;
  activeMembers: number;
  pendingMemberships: number;
  pendingKyc: number;
  pendingTransfers: number;
  pendingBillPayments: number;
  openDisputes: number;
  openSupportTickets: number;
  highRiskEvents: number;
  reconciliationMismatches: number;
  dueJobs: number;
  failedJobs: number;
  totalAccounts: number;
  totalTransactions: number;
};

export type AdminCommandCenterData = {
  metrics: AdminCommandCenterMetrics;
  alerts: AdminOperationalAlert[];
  recentAdminActivity: AdminAuditLogRecord[];
  recentEvents: EventLogRecord[];
  recentUsers: AdminUserSummary[];
  recentTransactions: AdminTransactionRecord[];
  recentSupportTickets: AdminSupportTicketRecord[];
};

export type AdminSystemHealthData = {
  status: "healthy" | "degraded" | "critical";
  database: "connected";
  emailConfigured: boolean;
  cronConfigured: boolean;
  demoSeedProtected: boolean;
  appUrl: string;
  systemMode: string;
  jobs: {
    due: number;
    failed: number;
    running: number;
    total: number;
  };
  reconciliation: {
    mismatchCount: number;
    noLedgerCount: number;
  };
  recentCronEvents: EventLogRecord[];
};

export type AdminSettingsData = {
  environment: string;
  appUrl: string;
  emailConfigured: boolean;
  adminAlertEmail: string | null;
  cronConfigured: boolean;
  demoSeedProtected: boolean;
  systemMode: string;
  featureFlags: Record<string, boolean>;
  bankingPolicy: BankingPolicyData;
};

export type BankingPolicyData = {
  requireTransactionOtp: boolean;
  requireTransferReview: boolean;
  updatedAt: string;
  updatedBy: string | null;
};

export type AdminMemberDetailData = {
  user: AdminUserSummary & { kycStatus?: KycStatus | null };
  profile: CustomerProfileRecord | null;
  accounts: AdminAccountRecord[];
  recentTransactions: AdminTransactionRecord[];
  openTicketCount: number;
  openDisputeCount: number;
  activeSessionCount: number;
  highRiskEventCount: number;
  recentEvents: EventLogRecord[];
};

export type AdminSessionRecord = {
  id: string;
  deviceName: string;
  ipAddress: string;
  location: string | null;
  isActive: boolean;
  lastSeenAt: string;
  createdAt: string;
  revokedAt: string | null;
  user: {
    id: string;
    fullName: string;
    email: string;
    status: UserStatus;
  };
};

export type AdminSessionsData = {
  sessions: AdminSessionRecord[];
  summary: {
    active: number;
    total: number;
  };
};
